/**
 * House tour frame management.
 *
 * 200 frames × ~650KB = ~130MB. We do NOT eager-import them all.
 * Instead, components call getFrameUrl(index) which returns a URL string.
 * The first 10 frames are pre-populated for instant hero backgrounds.
 */
import { useEffect, useState } from 'react'

// Vite lazy glob — returns Promises, not URLs
const frameModules = import.meta.glob('/src/assets/house-tour/frame-*.jpg', {
  eager: false,
  import: 'default',
})

const sortedKeys = Object.keys(frameModules).sort()
const urlCache = {}

/**
 * Ensure a frame's dynamic import is in-flight (or resolved).
 * Returns a Promise that resolves to the URL string.
 */
const inflight = {}

function ensureFrame(index) {
  if (urlCache[index]) return Promise.resolve(urlCache[index])
  if (inflight[index]) return inflight[index]

  const key = sortedKeys[index]
  if (!key) return Promise.resolve('')

  const promise = frameModules[key]().then((mod) => {
    const url = mod.default || mod
    urlCache[index] = url
    delete inflight[index]
    return url
  })

  inflight[index] = promise
  return promise
}

/**
 * Get URL for frame at `index`.
 * Returns the URL if already cached, otherwise kicks off the import
 * and returns ''. Use `useFrameUrl` for reactive components.
 */
export const getFrameUrl = (index) => urlCache[index] || ''

/**
 * Reactive hook — returns the URL for a single frame index.
 * Triggers a re-render when the frame finishes loading.
 */
export function useFrameUrl(index) {
  const [url, setUrl] = useState(() => urlCache[index] || '')

  useEffect(() => {
    // Already cached — no need to load
    if (urlCache[index]) {
      setUrl(urlCache[index])
      return
    }

    let cancelled = false
    ensureFrame(index).then((resolvedUrl) => {
      if (!cancelled) setUrl(resolvedUrl)
    })

    return () => { cancelled = true }
  }, [index])

  return url
}

export const TOTAL_FRAMES = sortedKeys.length

/**
 * Returns a Promise that resolves to the URL for the given frame index.
 * Resolves immediately if the frame is already cached.
 */
export function waitForFrame(index) {
  if (urlCache[index]) return Promise.resolve(urlCache[index])
  return ensureFrame(index)
}

// Kick off imports for the first 10 frames at module load time.
// This doesn't block — the Promises resolve in the background and
// populate urlCache so subsequent getFrameUrl calls return instantly.
for (let i = 0; i < Math.min(10, TOTAL_FRAMES); i++) {
  ensureFrame(i)
}

/**
 * React hook — returns a URL array where loaded frames resolve to strings
 * and unloaded ones stay as empty strings. Re-renders as frames load.
 */
export function useFrameUrls(indices) {
  const [urls, setUrls] = useState(() =>
    indices.map((i) => urlCache[i] || ''),
  )

  useEffect(() => {
    let cancelled = false

    const promises = indices.map((i, idx) =>
      ensureFrame(i).then((url) => {
        if (!cancelled) {
          setUrls((prev) => {
            const next = [...prev]
            if (next[idx] !== url) {
              next[idx] = url
              return next
            }
            return prev
          })
        }
      }),
    )

    return () => { cancelled = true }
  }, [indices.join(',')])

  return urls
}
