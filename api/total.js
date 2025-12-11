/**
 * Get Total Donations Endpoint
 * GET /api/total
 */
import { Redis } from '@upstash/redis';

// Initialize Upstash Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all donations from Redis store
    const donations = await redis.get('donations') || [];
    
    // Calculate total
    const total = donations.reduce((sum, donation) => sum + donation.amount, 0);
    
    res.status(200).json({
      total: total,
      count: donations.length,
      currency: 'IDR'
    });
  } catch (error) {
    console.error('Error getting total donations:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan server: ' + error.message,
      total: 0,
      count: 0,
      currency: 'IDR'
    });
  }
}
