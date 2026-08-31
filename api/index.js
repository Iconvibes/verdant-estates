export default async function handler(req, res) {
  try {
    const { default: app } = await import('../server/index.js')
    return app(req, res)
  } catch (err) {
    console.error('Function initialization failed:', err)
    res.status(500).json({ 
      error: 'Function initialization failed',
      message: err.message,
      stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
    })
  }
}
