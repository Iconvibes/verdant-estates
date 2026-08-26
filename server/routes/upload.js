/**
 * Image Upload Route
 * POST /api/upload — Upload property images to Supabase Storage
 */
import { Router } from 'express'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { v4 as uuidv4 } from 'uuid'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '.env') })

let supabase = null
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const mod = await import('../supabase/client.js')
  supabase = mod.default
}

const router = Router()

// POST /api/upload — Upload a single image
router.post('/', authenticate, requireAdmin, async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Image upload requires Supabase Storage' })
  try {
    const { file, filename } = req.body

    if (!file || !filename) {
      return res.status(400).json({ error: 'File data and filename are required' })
    }

    // Decode base64 data
    const base64Data = file.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    // Generate unique filename
    const ext = filename.split('.').pop() || 'jpg'
    const uniqueName = `${uuidv4()}.${ext}`
    const filePath = `listings/${uniqueName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('property-images')
      .upload(filePath, buffer, {
        contentType: `image/${ext}`,
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return res.status(500).json({ error: 'Failed to upload image' })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath)

    res.json({
      url: urlData.publicUrl,
      path: filePath,
      filename: uniqueName,
    })
  } catch (err) {
    console.error('Upload error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/upload/multiple — Upload multiple images
router.post('/multiple', authenticate, requireAdmin, async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Image upload requires Supabase Storage' })
  try {
    const { files } = req.body

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'Files array is required' })
    }

    const results = []

    for (const { file, filename } of files) {
      const base64Data = file.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')

      const ext = filename.split('.').pop() || 'jpg'
      const uniqueName = `${uuidv4()}.${ext}`
      const filePath = `listings/${uniqueName}`

      const { error } = await supabase.storage
        .from('property-images')
        .upload(filePath, buffer, {
          contentType: `image/${ext}`,
          upsert: false,
        })

      if (error) {
        console.error('Upload error for', filename, ':', error)
        continue
      }

      const { data: urlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath)

      results.push({
        url: urlData.publicUrl,
        path: filePath,
        filename: uniqueName,
        originalName: filename,
      })
    }

    res.json({ uploaded: results, count: results.length })
  } catch (err) {
    console.error('Multiple upload error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /api/upload — Delete an image
router.delete('/', authenticate, requireAdmin, async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Image upload requires Supabase Storage' })
  try {
    const { path } = req.body

    if (!path) {
      return res.status(400).json({ error: 'File path is required' })
    }

    const { error } = await supabase.storage
      .from('property-images')
      .remove([path])

    if (error) {
      console.error('Delete error:', error)
      return res.status(500).json({ error: 'Failed to delete image' })
    }

    res.json({ success: true })
  } catch (err) {
    console.error('Delete error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
