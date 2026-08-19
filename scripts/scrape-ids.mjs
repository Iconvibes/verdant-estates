/**
 * Scrapes photo IDs from Pexels search pages and merges them into scripts/pexels-ids.json.
 * A persistent cookie jar (Cloudflare's __cf_bm) makes every request pass the bot check.
 */
import { writeFile, readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileP = promisify(execFile)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const IDS_FILE = path.join(ROOT, 'scripts', 'pexels-ids.json')
const JAR = path.join(ROOT, 'scripts', '.pexels-cookies.txt')
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function curl(args, timeoutSec = 30) {
  const { stdout } = await execFileP(
    'curl',
    ['-s', '-m', String(timeoutSec), '-A', UA, '-b', JAR, '-c', JAR, ...args],
    { maxBuffer: 128 * 1024 * 1024 },
  )
  return stdout
}

async function scrapePhotoIds(query, pages) {
  const ids = []
  for (let page = 1; page <= pages; page++) {
    const url = `https://www.pexels.com/search/${encodeURIComponent(query)}/?page=${page}`
    let html = ''
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        html = await curl(['-H', 'Accept-Language: en-US,en;q=0.9', url])
      } catch {
        html = ''
      }
      if (html && !html.includes('Just a moment') && html.includes('images.pexels.com/photos/')) break
      console.log(`  ${query} p${page} attempt ${attempt}: challenged/empty, backing off ${4 * attempt}s`)
      await sleep(4000 * attempt)
    }
    ids.push(...[...new Set([...html.matchAll(/images\.pexels\.com\/photos\/(\d+)/g)].map((m) => m[1]))])
    await sleep(500)
  }
  return [...new Set(ids)]
}

const loadExisting = async () => {
  try {
    const data = JSON.parse(await readFile(IDS_FILE, 'utf8'))
    return { exterior: data.exterior || [], tour: data.tour || [] }
  } catch {
    return { exterior: [], tour: [] }
  }
}

const main = async () => {
  // warm the Cloudflare cookie first
  try {
    await curl(['-o', '/dev/null', 'https://www.pexels.com/'])
  } catch {}
  await sleep(1500)

  const existing = await loadExisting()
  console.log(`Existing: ${existing.exterior.length} exterior + ${existing.tour.length} tour IDs`)

  console.log('Scraping exterior photo IDs…')
  const exterior = [...existing.exterior]
  for (const [q, pages] of [['modern house exterior', 3], ['modern house', 2], ['luxury villa', 2]]) {
    const ids = await scrapePhotoIds(q, pages)
    exterior.push(...ids)
    console.log(`  ${q}: +${ids.length} IDs`)
    await sleep(800)
  }

  console.log('Scraping tour photo IDs…')
  const categories = [
    ['modern house', 2],
    ['modern house interior', 3],
    ['living room interior design', 3],
    ['modern kitchen interior', 3],
    ['luxury bedroom interior', 3],
    ['modern bathroom interior', 3],
    ['modern staircase interior', 2],
    ['modern home swimming pool', 2],
    ['luxury home', 2],
    ['modern villa', 2],
  ]
  const tour = [...existing.tour]
  for (const [q, pages] of categories) {
    const ids = await scrapePhotoIds(q, pages)
    tour.push(...ids)
    console.log(`  ${q}: +${ids.length} IDs`)
    await sleep(800)
  }

  const out = { exterior: [...new Set(exterior)], tour: [...new Set(tour)] }
  await writeFile(IDS_FILE, JSON.stringify(out, null, 2))
  console.log(
    `\nMerged: ${out.exterior.length} exterior + ${out.tour.length} tour IDs (total unique ${new Set([...out.exterior, ...out.tour]).size})`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
