/**
 * Health Check Endpoint
 * GET /api/health
 */
export default function handler(req, res) {
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Return health status
  res.status(200).json({
    status: 'ok',
    message: 'Server backend berjalan',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 'development'
  });
}
