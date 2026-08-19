/**
 * Downloads 200 walkthrough frames -> /src/assets/house-tour/frame-0001.jpg ... frame-0200.jpg
 * and 12 property photos -> /public/images/properties/property-1.jpg ... property-12.jpg
 * from images.pexels.com using the IDs scraped by scrape-ids.mjs.
 *
 * Resumable: valid JPEGs already on disk are skipped. Every slot falls back to spare IDs
 * when a photo's source is unreachable.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileP = promisify(execFile)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const IDS_FILE = path.join(ROOT, 'scripts', 'pexels-ids.json')
const TOUR_DIR = path.join(ROOT, 'src', 'assets', 'house-tour')
const PROPS_DIR = path.join(ROOT, 'public', 'images', 'properties')
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function isValidJpeg(file) {
  try {
    const buf = await readFile(file)
    return buf.length > 15000 && buf[0] === 0xff && buf[1] === 0xd8
  } catch {
    return false
  }
}

async function fetchImage(id, dest, width, height) {
  const url = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}&h=${height}&fit=crop`
  await execFileP('curl', ['-s', '-m', '45', '-A', UA, '-L', url, '-o', dest], { maxBuffer: 64 * 1024 * 1024 })
  if (!(await isValidJpeg(dest))) throw new Error(`bad jpeg for photo ${id}`)
}

/**
 * Fills each slot (primary id, with spare-ID fallback); skips slots already valid on disk.
 * Pass 1 tries primaries concurrently; pass 2 fills any remaining failures sequentially
 * from a shared spare pool (avoids the race where one slot drains all spares).
 */
async function fillSlots(slots, spares, width, height, concurrency = 4) {
  const results = slots.map(() => false)
  const sparePool = [...spares]
  const queue = []
  for (let i = 0; i < slots.length; i++) {
    if (await isValidJpeg(slots[i].dest)) {
      results[i] = true
    } else {
      queue.push({ ...slots[i], index: i })
    }
  }
  let done = slots.length - queue.length
  console.log(`  already on disk: ${done}/${slots.length}`)

  // Pass 1: concurrent, primary ID only
  const pass1 = [...queue]
  async function worker() {
    while (pass1.length) {
      const job = pass1.shift()
      try {
        await fetchImage(job.id, job.dest, width, height)
        results[job.index] = true
      } catch (err) {
        console.error(`  ${job.name}: primary ${job.id} failed (${err.message})`)
      }
      done++
      if (done % 20 === 0 || done === slots.length) console.log(`  progress: ${done}/${slots.length}`)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, pass1.length || 1) }, worker))

  // Pass 2: sequential spare fallback
  const failures = queue.filter((j) => !results[j.index])
  if (failures.length) {
    console.log(`  ${failures.length} slots need spare fallback (${sparePool.length} spares available)`)
    for (const job of failures) {
      while (sparePool.length && !results[job.index]) {
        const id = sparePool.shift()
        try {
          await fetchImage(id, job.dest, width, height)
          results[job.index] = true
          console.log(`  ${job.name}: filled with spare ${id}`)
        } catch {
          /* keep trying */
        }
        await sleep(200)
      }
    }
  }
  return results
}

const main = async () => {
  await mkdir(TOUR_DIR, { recursive: true })
  await mkdir(PROPS_DIR, { recursive: true })

  const ids = JSON.parse(await readFile(IDS_FILE, 'utf8'))
  const exterior = ids.exterior || []
  const tour = ids.tour || []
  console.log(`IDs available: ${exterior.length} exterior, ${tour.length} tour`)

  const used = new Set()
  const propertyJobs = []
  for (let i = 1; i <= 12; i++) {
    const id = exterior[(i - 1) % exterior.length]
    used.add(id)
    propertyJobs.push({ id, dest: path.join(PROPS_DIR, `property-${i}.jpg`), name: `property-${i}.jpg` })
  }

  const candidates = [...new Set(tour)].filter((id) => !used.has(id))
  const primaries = candidates.slice(0, 200)
  const spares = candidates.slice(200)
  const tourJobs = primaries.map((id, i) => ({
    id,
    dest: path.join(TOUR_DIR, `frame-${String(i + 1).padStart(4, '0')}.jpg`),
    name: `frame-${String(i + 1).padStart(4, '0')}.jpg`,
  }))
  console.log(`Tour: ${tourJobs.length} slots, ${spares.length} spare IDs`)
  if (primaries.length < 200) console.error('WARNING: fewer than 200 candidate IDs!')

  console.log('Downloading tour frames…')
  const tourOk = await fillSlots(tourJobs, spares, 1600, 900, 4)
  console.log('Downloading property photos…')
  const propOk = await fillSlots(propertyJobs, exterior.slice(12), 1200, 900, 3)

  const { readdir } = await import('node:fs/promises')
  const countJpgs = async (dir) => {
    try {
      const files = (await readdir(dir)).filter((f) => f.endsWith('.jpg'))
      let valid = 0
      for (const f of files) if (await isValidJpeg(path.join(dir, f))) valid++
      return { total: files.length, valid }
    } catch {
      return { total: 0, valid: 0 }
    }
  }
  const tourStats = await countJpgs(TOUR_DIR)
  const propStats = await countJpgs(PROPS_DIR)
  console.log(
    `\nRESULT — tour: ${tourStats.valid}/200 valid on disk | properties: ${propStats.valid}/12 valid on disk`,
  )
  process.exitCode = tourStats.valid === 200 && propStats.valid === 12 ? 0 : 1
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
