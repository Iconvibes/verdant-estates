// Bundles every local frame in /src/assets/house-tour (frame-0001.jpg … frame-0200.jpg)
// as an ordered array of URLs. Vite inlines the file list at build time — no network.
const frameModules = import.meta.glob('/src/assets/house-tour/frame-*.jpg', {
  eager: true,
  import: 'default',
})

export const tourFrames = Object.keys(frameModules)
  .sort()
  .map((key) => frameModules[key])

export const TOTAL_FRAMES = tourFrames.length
