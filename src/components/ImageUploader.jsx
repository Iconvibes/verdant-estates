/**
 * ImageUploader — Drag-and-drop multi-image upload component.
 * Used in the admin dashboard for property photos.
 *
 * Props:
 *   images: string[]          — current image URLs
 *   onChange: (urls: string[]) => void — called when images change
 *   maxImages?: number        — default 20
 *   listingId?: number        — for server-side temp naming
 */
import { useCallback, useRef, useState } from 'react'
import { CloseIcon, SearchIcon } from './icons'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function uploadFile(file, token) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const headers = { 'Content-Type': 'application/json' }
        if (token) headers.Authorization = `Bearer ${token}`

        const res = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            file: reader.result,
            filename: file.name,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Upload failed')
        resolve(data.url)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export default function ImageUploader({
  images = [],
  onChange,
  maxImages = 20,
  listingId,
}) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 })
  const [dragOver, setDragOver] = useState(false)
  const [previewIdx, setPreviewIdx] = useState(null)
  const fileInputRef = useRef(null)

  const getToken = () => {
    try {
      const auth = JSON.parse(localStorage.getItem('verdant_auth') || '{}')
      return auth.token || null
    } catch {
      return null
    }
  }

  const handleFiles = useCallback(
    async (files) => {
      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith('image/'),
      )
      if (imageFiles.length === 0) return

      const remaining = maxImages - images.length
      const toUpload = imageFiles.slice(0, remaining)
      if (toUpload.length < imageFiles.length) {
        alert(
          `Can only add ${remaining} more image(s). ${imageFiles.length - toUpload.length} skipped.`,
        )
      }

      setUploading(true)
      setUploadProgress({ done: 0, total: toUpload.length })
      const token = getToken()
      const newUrls = []

      for (const file of toUpload) {
        try {
          const url = await uploadFile(file, token)
          newUrls.push(url)
        } catch (err) {
          console.error('Upload failed:', file.name, err)
        }
        setUploadProgress((p) => ({ ...p, done: p.done + 1 }))
      }

      onChange([...images, ...newUrls])
      setUploading(false)
      setUploadProgress({ done: 0, total: 0 })
    },
    [images, onChange, maxImages],
  )

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setDragOver(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleInputChange = useCallback(
    (e) => {
      handleFiles(e.target.files)
      e.target.value = ''
    },
    [handleFiles],
  )

  const removeImage = useCallback(
    (idx) => {
      const next = images.filter((_, i) => i !== idx)
      onChange(next)
      setPreviewIdx(null)
    },
    [images, onChange],
  )

  const moveImage = useCallback(
    (from, to) => {
      if (to < 0 || to >= images.length) return
      const next = [...images]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      onChange(next)
    },
    [images, onChange],
  )

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors ${
          dragOver
            ? 'border-bronze bg-bronze/5'
            : 'border-cream hover:border-bronze/50 hover:bg-cream/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />

        {uploading ? (
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-bronze border-t-transparent" />
            <p className="mt-3 text-sm text-text/60">
              Uploading {uploadProgress.done + 1} of {uploadProgress.total}…
            </p>
            <div className="mx-auto mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-cream">
              <div
                className="h-full rounded-full bg-bronze transition-all duration-300"
                style={{
                  width: `${(uploadProgress.done / uploadProgress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-forest/10">
              <svg
                className="h-6 w-6 text-forest"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <p className="mt-3 text-sm font-semibold text-forest">
              Drop images here or click to browse
            </p>
            <p className="mt-1 text-xs text-text/50">
              JPG, PNG, WebP — up to {maxImages} images (
              {images.length}/{maxImages} added)
            </p>
          </div>
        )}
      </div>

      {/* Thumbnail grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-cream bg-cream"
            >
              <img
                src={url}
                alt={`Property photo ${idx + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />

              {/* Overlay controls */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                {/* Preview */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setPreviewIdx(idx)
                  }}
                  className="rounded-full bg-white/90 p-1.5 text-forest shadow-sm transition-colors hover:bg-white"
                  title="Preview"
                >
                  <SearchIcon className="h-3.5 w-3.5" />
                </button>

                {/* Move left */}
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      moveImage(idx, idx - 1)
                    }}
                    className="rounded-full bg-white/90 px-1.5 py-1 text-[0.6rem] font-bold text-forest shadow-sm hover:bg-white"
                    title="Move left"
                  >
                    ←
                  </button>
                )}

                {/* Move right */}
                {idx < images.length - 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      moveImage(idx, idx + 1)
                    }}
                    className="rounded-full bg-white/90 px-1.5 py-1 text-[0.6rem] font-bold text-forest shadow-sm hover:bg-white"
                    title="Move right"
                  >
                    →
                  </button>
                )}

                {/* Remove */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage(idx)
                  }}
                  className="rounded-full bg-red-500/90 p-1.5 text-white shadow-sm transition-colors hover:bg-red-500"
                  title="Remove"
                >
                  <CloseIcon className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Position badge */}
              <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[0.55rem] font-bold text-white">
                {idx + 1}
              </span>

              {/* Hero badge */}
              {idx === 0 && (
                <span className="absolute right-1 top-1 rounded bg-bronze/90 px-1.5 py-0.5 text-[0.55rem] font-bold text-forest-deep">
                  HERO
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox preview */}
      {previewIdx !== null && images[previewIdx] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewIdx(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewIdx(null)}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/40"
          >
            <CloseIcon className="h-6 w-6" />
          </button>

          <div
            className="relative max-h-[85vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[previewIdx]}
              alt={`Preview ${previewIdx + 1}`}
              className="max-h-[85vh] rounded-lg object-contain shadow-lift"
            />

            {/* Nav arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setPreviewIdx(
                      (previewIdx - 1 + images.length) % images.length,
                    )
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setPreviewIdx((previewIdx + 1) % images.length)
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                >
                  →
                </button>
              </>
            )}

            <p className="mt-2 text-center text-sm text-white/70">
              {previewIdx + 1} / {images.length}
              {previewIdx === 0 && ' — Hero image'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
