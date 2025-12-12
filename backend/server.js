const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// ======================
// 1. SETUP CORS
// ======================
app.use(cors({
  origin: true, // Izinkan semua origin di development
  credentials: true
}));

// ======================
// 2. SETUP FOLDER UPLOAD
// ======================
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Folder uploads dibuat:', uploadsDir);
}

// ======================
// 3. KONFIGURASI MULTER
// ======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `donasi-${uniqueName}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// ======================
// 4. MIDDLEWARE
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// ======================
// 5. DATA STORAGE
// ======================
let donations = [];
let fundUsage = [];

// ======================
// 6. ROUTES
// ======================

// 6.1 Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server backend berjalan',
    timestamp: new Date().toISOString()
  });
});

// 6.2 Submit Donasi dengan Upload File
app.post('/api/donations', upload.single('proofImage'), (req, res) => {
  try {
    console.log('📨 Data diterima:', req.body);
    console.log('📁 File diterima:', req.file ? req.file.filename : 'Tidak ada file');
    
    const { name, email, phone, amount, paymentMethod, message } = req.body;
    
    // Validasi
    if (!name || !email || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Nama, email, dan jumlah donasi wajib diisi'
      });
    }
    
    // Buat objek donasi
    const newDonation = {
      id: donations.length + 1,
      name,
      email,
      phone: phone || '',
      amount: parseFloat(amount),
      paymentMethod: paymentMethod || 'bank-transfer',
      message: message || '',
      proofImage: req.file ? `/uploads/${req.file.filename}` : null,
      date: new Date().toISOString(),
      status: 'pending'
    };
    
    // Simpan ke memory
    donations.push(newDonation);
    
    // Simpan ke file JSON (opsional)
    const dataPath = path.join(__dirname, 'donations.json');
    fs.writeFileSync(dataPath, JSON.stringify(donations, null, 2));
    
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
      error: 'Terjadi kesalahan server'
    });
  }
});

// 6.3 Get semua donasi
app.get('/api/donations', (req, res) => {
  res.json(donations);
});

// 6.4 Get total donasi
app.get('/api/donations/total', (req, res) => {
  const total = donations.reduce((sum, donation) => sum + donation.amount, 0);
  res.json({
    total: total,
    count: donations.length,
    currency: 'IDR'
  });
});

// 6.5 Update donasi amount
app.put('/api/donations', (req, res) => {
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
    
    // Find donation index
    const donationIndex = donations.findIndex(d => d.id === parseInt(id));
    
    if (donationIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Donasi tidak ditemukan'
      });
    }
    
    // Update amount
    donations[donationIndex].amount = parseFloat(amount);
    
    // Save to file
    const dataPath = path.join(__dirname, 'donations.json');
    fs.writeFileSync(dataPath, JSON.stringify(donations, null, 2));
    
    console.log('✅ Donasi diupdate:', id, 'Amount:', amount);
    
    res.json({
      success: true,
      message: 'Donasi berhasil diupdate',
      data: donations[donationIndex]
    });
    
  } catch (error) {
    console.error('❌ Error updating donation:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// 6.6 Delete donasi
app.delete('/api/donations', (req, res) => {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID donasi diperlukan'
      });
    }
    
    // Find donation index
    const donationIndex = donations.findIndex(d => d.id === parseInt(id));
    
    if (donationIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Donasi tidak ditemukan'
      });
    }
    
    // Get the donation before deleting (to delete the image file)
    const donation = donations[donationIndex];
    
    // Delete the proof image file if exists
    if (donation.proofImage) {
      const imagePath = path.join(__dirname, 'public', donation.proofImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('🗑️ File gambar dihapus:', imagePath);
      }
    }
    
    // Remove from array
    donations.splice(donationIndex, 1);
    
    // Save to file
    const dataPath = path.join(__dirname, 'donations.json');
    fs.writeFileSync(dataPath, JSON.stringify(donations, null, 2));
    
    console.log('✅ Donasi dihapus:', id);
    
    res.json({
      success: true,
      message: 'Donasi berhasil dihapus'
    });
    
  } catch (error) {
    console.error('❌ Error deleting donation:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// 6.7 Get fund usage
app.get('/api/fund-usage', (req, res) => {
  res.json(fundUsage);
});

// 6.8 Add fund usage
app.post('/api/fund-usage', (req, res) => {
  try {
    const { category, amount, description } = req.body;
    
    if (!category || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Kategori dan jumlah wajib diisi'
      });
    }
    
    const newFundUsage = {
      id: fundUsage.length + 1,
      category,
      amount: parseFloat(amount),
      description: description || '',
      date: new Date().toISOString()
    };
    
    fundUsage.push(newFundUsage);
    
    // Save to file
    const dataPath = path.join(__dirname, 'fund-usage.json');
    fs.writeFileSync(dataPath, JSON.stringify(fundUsage, null, 2));
    
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
      error: 'Terjadi kesalahan server'
    });
  }
});

// 6.9 Delete fund usage
app.delete('/api/fund-usage', (req, res) => {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID penggunaan dana diperlukan'
      });
    }
    
    const usageIndex = fundUsage.findIndex(u => u.id === parseInt(id));
    
    if (usageIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Penggunaan dana tidak ditemukan'
      });
    }
    
    fundUsage.splice(usageIndex, 1);
    
    // Save to file
    const dataPath = path.join(__dirname, 'fund-usage.json');
    fs.writeFileSync(dataPath, JSON.stringify(fundUsage, null, 2));
    
    console.log('✅ Penggunaan dana dihapus:', id);
    
    res.json({
      success: true,
      message: 'Penggunaan dana berhasil dihapus'
    });
    
  } catch (error) {
    console.error('❌ Error deleting fund usage:', error);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
});

// 6.10 Test upload endpoint
app.post('/api/test-upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Tidak ada file' });
  }
  
  res.json({
    success: true,
    message: 'File berhasil diupload!',
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`
  });
});

// ======================
// 7. START SERVER
// ======================
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 SERVER BACKEND BERJALAN');
  console.log('='.repeat(50));
  console.log(`📍 Port: http://localhost:${PORT}`);
  console.log(`📁 Upload folder: ${uploadsDir}`);
  console.log('\n🔗 Endpoints:');
  console.log('   GET    /api/health');
  console.log('   GET    /api/donations');
  console.log('   GET    /api/donations/total');
  console.log('   POST   /api/donations');
  console.log('   PUT    /api/donations?id={id}');
  console.log('   DELETE /api/donations?id={id}');
  console.log('   GET    /api/fund-usage');
  console.log('   POST   /api/fund-usage');
  console.log('   DELETE /api/fund-usage?id={id}');
  console.log('   POST   /api/test-upload');

  console.log('='.repeat(50) + '\n');
});
