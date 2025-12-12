/**
 * Donations Endpoint
 * GET /api/donations - Get all donations
 * POST /api/donations - Submit new donation with file upload
 */
import { Redis } from '@upstash/redis';
import { put } from '@vercel/blob';
import formidable from 'formidable';

// Initialize Upstash Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

// Disable body parser for file upload
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Parse multipart form data
 */
function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: 4.5 * 1024 * 1024, // 4.5MB (Vercel limit)
      allowEmptyFiles: false,
      filter: function ({ mimetype }) {
        // Only allow images
        return mimetype && mimetype.includes('image');
      },
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    });
  });
}

/**
 * GET Handler - Get all donations
 */
async function handleGet(req, res) {
  try {
    const donations = await redis.get('donations') || [];
    res.status(200).json(donations);
  } catch (error) {
    console.error('Error getting donations:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + error.message
    });
  }
}

/**
 * POST Handler - Submit new donation
 */
async function handlePost(req, res) {
  try {
    // Parse form data
    const { fields, files } = await parseForm(req);
    
    // Extract fields (formidable returns arrays)
    const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
    const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
    const phone = Array.isArray(fields.phone) ? fields.phone[0] : fields.phone;
    const amount = Array.isArray(fields.amount) ? fields.amount[0] : fields.amount;
    const paymentMethod = Array.isArray(fields.paymentMethod) ? fields.paymentMethod[0] : fields.paymentMethod;
    const message = Array.isArray(fields.message) ? fields.message[0] : fields.message;
    
    console.log('📨 Data diterima:', { name, email, phone, amount, paymentMethod });
    
    // Validasi
    if (!name || !email || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Nama, email, dan jumlah donasi wajib diisi'
      });
    }
    
    // Handle file upload to Vercel Blob
    let proofImageUrl = null;
    if (files.proofImage) {
      const file = Array.isArray(files.proofImage) ? files.proofImage[0] : files.proofImage;
      
      console.log('📁 File diterima:', file.originalFilename);
      
      // Read file buffer using fs.promises
      const { readFile } = await import('fs/promises');
      const fileBuffer = await readFile(file.filepath);
      
      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1E9);
      const ext = file.originalFilename.split('.').pop();
      const filename = `donasi-${timestamp}-${random}.${ext}`;
      
      // Upload to Vercel Blob
      const blob = await put(filename, fileBuffer, {
        access: 'public',
        contentType: file.mimetype,
      });
      
      proofImageUrl = blob.url;
      console.log('✅ File uploaded to Blob:', proofImageUrl);
    }
    
    // Get existing donations
    const donations = await redis.get('donations') || [];
    
    // Create new donation object
    const newDonation = {
      id: donations.length + 1,
      name: name || '',
      email: email || '',
      phone: phone || '',
      amount: parseFloat(amount),
      paymentMethod: paymentMethod || 'bank-transfer',
      message: message || '',
      proofImage: proofImageUrl,
      date: new Date().toISOString(),
      status: 'pending'
    };
    
    // Add to donations array
    donations.push(newDonation);
    
    // Save to Redis store
    await redis.set('donations', donations);
    
    console.log('✅ Donasi disimpan:', newDonation);
    
    res.status(201).json({
      success: true,
      message: 'Donasi berhasil dikirim!',
      data: newDonation
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + error.message
    });
  }
}

/**
 * PUT Handler - Update donation amount
 */
async function handlePut(req, res) {
  try {
    const { id } = req.query;
    const { amount } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID donasi diperlukan'
      });
    }
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Jumlah donasi harus lebih dari 0'
      });
    }
    
    // Get existing donations
    const donations = await redis.get('donations') || [];
    
    // Find donation to update
    const donationIndex = donations.findIndex(d => d.id === parseInt(id));
    
    if (donationIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Donasi tidak ditemukan'
      });
    }
    
    // Update donation amount
    donations[donationIndex].amount = parseFloat(amount);
    
    // Save updated donations to Redis
    await redis.set('donations', donations);
    
    console.log('✅ Donasi diupdate:', id, 'Amount:', amount);
    
    res.status(200).json({
      success: true,
      message: 'Donasi berhasil diupdate',
      data: donations[donationIndex]
    });
    
  } catch (error) {
    console.error('❌ Error updating donation:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server: ' + error.message
    });
  }
}

/**
 * DELETE Handler - Delete a donation
 */
async function handleDelete(req, res) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID donasi diperlukan'
      });
    }
    
    // Get existing donations
    const donations = await redis.get('donations') || [];
    
    // Find donation to delete
    const donationIndex = donations.findIndex(d => d.id === parseInt(id));
    
    if (donationIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Donasi tidak ditemukan'
      });
    }
    
    // Remove donation from array
    donations.splice(donationIndex, 1);
    
    // Save updated donations to Redis
    await redis.set('donations', donations);
    
    console.log('✅ Donasi dihapus:', id);
    
    res.status(200).json({
      success: true,
      message: 'Donasi berhasil dihapus'
    });
    
  } catch (error) {
    console.error('❌ Error deleting donation:', error);
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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
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
  } else if (req.method === 'PUT') {
    return handlePut(req, res);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
