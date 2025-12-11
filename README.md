# 🤝 Website Donasi - ULTRAS SMEKDA

Website donasi untuk membantu korban bencana Sumatera. Dibangun dengan React + Vite dan di-deploy di Vercel dengan serverless architecture.

## 🌟 Features

- ✅ Form donasi multi-step (Jumlah → Data Diri → Pembayaran)
- ✅ Upload bukti transfer
- ✅ Opsi donasi anonim
- ✅ Multiple payment methods (Bank Transfer & E-Wallet)
- ✅ Real-time donation tracking
- ✅ Responsive design
- ✅ Serverless backend (Vercel Functions)
- ✅ File storage dengan Vercel Blob
- ✅ Data persistence dengan Vercel KV

## 🚀 Tech Stack

### Frontend
- **React 19** - UI Library
- **Vite** - Build tool & dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend (Serverless)
- **Vercel Functions** - Serverless API endpoints
- **Vercel Blob** - File storage untuk bukti transfer
- **Vercel KV** - Redis-based data storage
- **Formidable** - Multipart form parsing

## 📁 Project Structure

```
donasi-website/
├── api/                      # Vercel Serverless Functions
│   ├── health.js            # Health check endpoint
│   ├── donations.js         # GET/POST donations
│   └── total.js             # Get total donations
├── src/
│   ├── components/          # React components
│   │   └── Header.jsx
│   ├── pages/              # Page components
│   │   ├── HomePage.jsx
│   │   └── DonationFormPage.jsx
│   ├── App.jsx
│   └── main.jsx
├── backend/                 # Legacy Express server (for local dev)
│   ├── server.js
│   └── donations.json
├── scripts/
│   └── migrate-data.js     # Data migration helper
├── vercel.json             # Vercel configuration
├── .env.example            # Environment variables template
└── package.json
```

## 🛠️ Installation & Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd donasi-website
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Vercel credentials:

```env
BLOB_READ_WRITE_TOKEN=your_blob_token_here
KV_REST_API_URL=your_kv_url_here
KV_REST_API_TOKEN=your_kv_token_here
```

**How to get credentials:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Storage** tab
3. Create **Blob Store** and **KV Store**
4. Copy the credentials

### 4. Run Development Server

**Option A: Using Vercel CLI (Recommended)**
```bash
# Install Vercel CLI globally
npm install -g vercel

# Run dev server with serverless functions
vercel dev
```

**Option B: Using Vite only (Frontend only)**
```bash
npm run dev
```

**Option C: Run both frontend and backend (Legacy)**
```bash
npm run dev:all
```

## 📦 Deployment to Vercel

### Method 1: Using Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Method 2: Using Vercel Dashboard

1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/new)
3. Import your repository
4. Configure environment variables:
   - `BLOB_READ_WRITE_TOKEN`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
5. Deploy!

### Method 3: Using Git Integration

```bash
# Push to main branch
git push origin main

# Vercel will automatically deploy
```

## 🔄 Data Migration

If you have existing data in `backend/donations.json`, migrate it to Vercel KV:

```bash
# Make sure environment variables are set
node scripts/migrate-data.js
```

Or manually:
1. Go to Vercel Dashboard → Storage → KV
2. Create key: `donations`
3. Paste JSON data from `backend/donations.json`

## 🌐 API Endpoints

### GET /api/health
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "message": "Server backend berjalan",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### GET /api/donations
Get all donations

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "08123456789",
    "amount": 100000,
    "paymentMethod": "bank-transfer",
    "message": "Semoga membantu",
    "proofImage": "https://blob.vercel-storage.com/...",
    "date": "2024-01-01T00:00:00.000Z",
    "status": "pending"
  }
]
```

### POST /api/donations
Submit new donation with file upload

**Request (multipart/form-data):**
- `name` (string, required)
- `email` (string, required)
- `phone` (string, optional)
- `amount` (number, required)
- `paymentMethod` (string, optional)
- `message` (string, optional)
- `proofImage` (file, required) - Max 4.5MB

**Response:**
```json
{
  "success": true,
  "message": "Donasi berhasil dikirim!",
  "data": {
    "id": 1,
    "name": "John Doe",
    "amount": 100000,
    "proofImage": "https://blob.vercel-storage.com/...",
    ...
  }
}
```

### GET /api/total
Get total donations

**Response:**
```json
{
  "total": 1500000,
  "count": 15,
  "currency": "IDR"
}
```

## 🔧 Configuration

### vercel.json

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "functions": {
    "api/**/*.js": {
      "maxDuration": 10
    }
  }
}
```

## 🐛 Troubleshooting

### Issue: "Module not found: @vercel/kv"
**Solution:** Make sure you've installed dependencies:
```bash
npm install @vercel/kv @vercel/blob formidable
```

### Issue: "KV_REST_API_URL is not defined"
**Solution:** Set up environment variables in Vercel Dashboard or `.env.local`

### Issue: File upload fails
**Solution:** 
- Check file size (max 4.5MB)
- Verify BLOB_READ_WRITE_TOKEN is set
- Check file type (only images allowed)

### Issue: CORS errors
**Solution:** CORS headers are already configured in `api/donations.js`. If issues persist, check Vercel logs.

## 📝 Development Notes

### Local Development
- Use `vercel dev` to test serverless functions locally
- Frontend runs on `http://localhost:3000`
- API endpoints available at `http://localhost:3000/api/*`

### File Upload Limits
- Vercel Serverless: 4.5MB max
- Vercel Blob: Unlimited storage (pay per usage)

### Database
- Using Vercel KV (Redis) for simple key-value storage
- For production with high traffic, consider upgrading to Vercel Postgres

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👥 Contact

**ULTRAS SMEKDA**
- Email: ultrassmekda@gmail.com
- Phone: 0812-3456-7890

## 🙏 Acknowledgments

- React Team for amazing framework
- Vercel for serverless platform
- All contributors and donors

---

Made with ❤️ by ULTRAS SMEKDA for Sumatera
