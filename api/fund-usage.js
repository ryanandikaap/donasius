/**
 * Fund Usage Endpoint
 * GET /api/fund-usage - Get all fund usage
 * POST /api/fund-usage - Add new fund usage
 * DELETE /api/fund-usage - Delete fund usage
 */
import { Redis } from '@upstash/redis';

// Initialize Upstash Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

/**
 * GET Handler - Get all fund usage
 */
async function handleGet(req, res) {
  try {
    const fundUsage = await redis.get('fundUsage') || [];
    res.status(200).json(fundUsage);
  } catch (error) {
    console.error('Error getting fund usage:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + error.message
    });
  }
}

/**
 * POST Handler - Add new fund usage
 */
async function handlePost(req, res) {
  try {
    const { category, amount, description } = req.body;
    
    if (!category || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Kategori dan jumlah wajib diisi'
      });
    }
    
    // Get existing fund usage
    const fundUsage = await redis.get('fundUsage') || [];
    
    // Create new fund usage object
    const newFundUsage = {
      id: fundUsage.length + 1,
      category,
      amount: parseFloat(amount),
      description: description || '',
      date: new Date().toISOString()
    };
    
    // Add to fund usage array
    fundUsage.push(newFundUsage);
    
    // Save to Redis
    await redis.set('fundUsage', fundUsage);
    
    console.log('✅ Penggunaan dana ditambahkan:', newFundUsage);
    
    res.status(201).json({
      success: true,
      message: 'Penggunaan dana berhasil ditambahkan',
      data: newFundUsage
    });
    
  } catch (error) {
    console.error('❌ Error adding fund usage:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + error.message
    });
  }
}

/**
 * DELETE Handler - Delete fund usage
 */
async function handleDelete(req, res) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID penggunaan dana diperlukan'
      });
    }
    
    // Get existing fund usage
    const fundUsage = await redis.get('fundUsage') || [];
    
    // Find fund usage to delete
    const usageIndex = fundUsage.findIndex(u => u.id === parseInt(id));
    
    if (usageIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Penggunaan dana tidak ditemukan'
      });
    }
    
    // Remove from array
    fundUsage.splice(usageIndex, 1);
    
    // Save updated fund usage to Redis
    await redis.set('fundUsage', fundUsage);
    
    console.log('✅ Penggunaan dana dihapus:', id);
    
    res.status(200).json({
      success: true,
      message: 'Penggunaan dana berhasil dihapus'
    });
    
  } catch (error) {
    console.error('❌ Error deleting fund usage:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + error.message
    });
  }
}

/**
 * Main handler
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Route to appropriate handler
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
