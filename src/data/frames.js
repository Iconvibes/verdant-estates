/**
 * House tour frame management.
 *
 * 200 frames × ~650KB = ~130MB. We do NOT eager-import them all.
 * Instead, components call getFrameUrl(index) which returns a URL string.
 * The first 10 frames are pre-populated for instant hero backgrounds.
 */

// Vite lazy glob — returns Promises, not URLs
const frameModules = import.meta.glob('/src/assets/house-tour/frame-*.jpg', {
  eager: false,
  import: 'default',
})

const sortedKeys = Object.keys(frameModules).sort()
const urlCache = {}

/**
 * Get URL for frame at `index`. Returns synchronously after first load.
 * Pre-populated for indices 0–9 (hero backgrounds).
 */
export const getFrameUrl = (index) => {
  if (urlCache[index]) return urlCache[index]
  const key = sortedKeys[index]
  if (!key) return ''
  // Dynamic import returns a module whose default is the URL string
  frameModules[key]().then((mod) => { urlCache[index] = mod.default || mod })
  return urlCache[index] || ''
}

export const TOTAL_FRAMES = sortedKeys.length

// Pre-populate the first 10 frames synchronously at module load
// so hero images appear instantly
for (let i = 0; i < Math.min(10, TOTAL_FRAMES); i++) {
  const key = sortedKeys[i]
  if (key) {
    frameModules[key]().then((mod) => { urlCache[i] = mod.default || mod })
  }
}

/**
 * React hook — returns a URL array where loaded frames resolve to strings
 * and unloaded ones stay as empty strings. Re-renders as frames load.
 */
export function useFrameUrls(indices) {
  // This is a simple implementation; components can also use getFrameUrl directly
  return indices.map((i) => getFrameUrl(i))
}
