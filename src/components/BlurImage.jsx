import { useState } from 'react'

/**
 * <BlurImage src="..." alt="..." />
 *
 * Renders a tiny 20px-wide placeholder version of the same image,
 * heavily blurred, then crossfades to the full-resolution image
 * once it finishes loading. Gives the "blur-up" effect used by
 * Medium, Gatsby, and premium real estate sites.
 */
const BlurImage = ({ src, alt, className = '', ...props }) => {
  const [loaded, setLoaded] = useState(false)

  return (
    <span className={`relative block overflow-hidden ${className}`}>
      {/* Blurred placeholder — always rendered behind */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover scale-110 blur-xl transition-opacity duration-500"
        style={{ opacity: loaded ? 0 : 1 }}
      />

      {/* Full image — fades in on load */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        {...props}
      />
    </span>
  )
}

export default BlurImage
