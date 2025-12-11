# 🚀 Deployment Guide - Vercel

Panduan lengkap untuk deploy website donasi ke Vercel dengan serverless architecture.

## 📋 Prerequisites

- [x] Akun Vercel (gratis) - [Sign up here](https://vercel.com/signup)
- [x] Git repository (GitHub, GitLab, atau Bitbucket)
- [x] Node.js 18+ installed

## 🎯 Deployment Steps

### Step 1: Setup Vercel Storage

#### 1.1 Create Vercel Blob Store

1. Login ke [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik **Storage** di sidebar
3. Klik **Create Database**
4. Pilih **Blob** → **Continue**
5. Beri nama: `donasi-blob-storage`
6. Pilih region: **Singapore** (terdekat dengan Indonesia)
7. Klik **Create**
8. Copy credentials:
   - `BLOB_READ_WRITE_TOKEN`

#### 1.2 Create Vercel KV Store

1. Di halaman Storage, klik **Create Database** lagi
2. Pilih **KV** → **Continue**
3. Beri nama: `donasi-kv-store`
4. Pilih region: **Singapore**
5. Klik **Create**
6. Copy credentials:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push code ke GitHub**
   ```bash
   git add .
   git commit -m "Setup Vercel deployment"
   git push origin main
   ```

2. **Import di Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Click **Import Project**
   - Select your repository
   - Click **Import**

3. **Configure Project**
   - Framework Preset: **Vite**
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `dist` (default)

4. **Add Environment Variables**
   
   Click **Environment Variables** dan tambahkan:
   
   | Name | Value | Environment |
   |------|-------|-------------|
   | `BLOB_READ_WRITE_TOKEN` | (dari Step 1.1) | Production, Preview, Development |
   | `KV_REST_API_URL` | (dari Step 1.2) | Production, Preview, Development |
   | `KV_REST_API_TOKEN` | (dari Step 1.2) | Production, Preview, Development |

5. **Deploy**
   - Click **Deploy**
   - Wait 1-2 minutes
   - Your site is live! 🎉

#### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Link Project**
   ```bash
   vercel link
   ```
   
   Follow prompts:
   - Set up and deploy? **Y**
   - Which scope? (select your account)
   - Link to existing project? **N**
   - Project name? `donasi-website`
   - Directory? `./`

4. **Add Environment Variables**
   ```bash
   vercel env add BLOB_READ_WRITE_TOKEN
   # Paste token, select all environments
   
   vercel env add KV_REST_API_URL
   # Paste URL, select all environments
   
   vercel env add KV_REST_API_TOKEN
   # Paste token, select all environments
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Step 3: Connect Storage to Project

1. **Go to Project Settings**
   - Vercel Dashboard → Your Project → Settings

2. **Connect Blob Storage**
   - Go to **Storage** tab
   - Click **Connect Store**
   - Select `donasi-blob-storage`
   - Click **Connect**

3. **Connect KV Storage**
   - Still in **Storage** tab
   - Click **Connect Store** again
   - Select `donasi-kv-store`
   - Click **Connect**

### Step 4: Migrate Data

#### 4.1 Initialize KV Store

1. **Go to KV Dashboard**
   - Vercel Dashboard → Storage → `donasi-kv-store`

2. **Create Initial Key**
   - Click **Add Key**
   - Key: `donations`
   - Value: `[]` (empty array)
   - Click **Save**

#### 4.2 Migrate Existing Data (Optional)

If you have data in `backend/donations.json`:

**Method 1: Manual**
1. Open `backend/donations.json`
2. Copy the JSON array
3. Go to KV Dashboard
4. Edit key `donations`
5. Paste JSON data
6. Click **Save**

**Method 2: Using Script**
```bash
# Pull environment variables
vercel env pull .env.local

# Run migration script
node scripts/migrate-data.js
```

### Step 5: Verify Deployment

1. **Check Health Endpoint**
   ```bash
   curl https://your-domain.vercel.app/api/health
   ```
   
   Expected response:
   ```json
   {
     "status": "ok",
     "message": "Server backend berjalan",
     "timestamp": "2025-01-01T00:00:00.000Z",
     "environment": "production"
   }
   ```

2. **Test Donations Endpoint**
   ```bash
   curl https://your-domain.vercel.app/api/donations
   ```
   
   Expected response:
   ```json
   []
   ```

3. **Test Frontend**
   - Open `https://your-domain.vercel.app`
   - Navigate to donation form
   - Try submitting a test donation
   - Verify file upload works
   - Check if data appears in KV store

### Step 6: Setup Custom Domain (Optional)

1. **Go to Project Settings**
   - Vercel Dashboard → Your Project → Settings → Domains

2. **Add Domain**
   - Enter your domain: `donasi.yourdomain.com`
   - Click **Add**

3. **Configure DNS**
   - Add CNAME record in your DNS provider:
     - Name: `donasi`
     - Value: `cname.vercel-dns.com`
   - Wait for DNS propagation (5-30 minutes)

4. **Verify**
   - Vercel will automatically issue SSL certificate
   - Your site is now live at custom domain! 🎉

## 🔄 Continuous Deployment

Once deployed, Vercel automatically:
- ✅ Deploys on every push to `main` branch
- ✅ Creates preview deployments for pull requests
- ✅ Runs build checks
- ✅ Invalidates cache

To deploy:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will automatically deploy in ~1-2 minutes.

## 🧪 Testing Locally with Vercel

Test serverless functions locally before deploying:

```bash
# Pull environment variables
vercel env pull .env.local

# Run dev server with serverless functions
vercel dev
```

This will:
- Start Vite dev server
- Run serverless functions locally
- Use your production environment variables
- Simulate Vercel's production environment

## 📊 Monitoring & Logs

### View Deployment Logs
1. Vercel Dashboard → Your Project → Deployments
2. Click on a deployment
3. View **Build Logs** and **Function Logs**

### View Function Logs
1. Vercel Dashboard → Your Project → Logs
2. Filter by function: `api/donations`, `api/health`, etc.
3. View real-time logs

### Monitor Storage Usage
1. Vercel Dashboard → Storage
2. View Blob storage usage
3. View KV operations count

## 🐛 Troubleshooting

### Issue: "Module not found: @vercel/kv"
**Solution:**
```bash
npm install @vercel/kv @vercel/blob formidable
git add package.json package-lock.json
git commit -m "Add Vercel dependencies"
git push
```

### Issue: "BLOB_READ_WRITE_TOKEN is not defined"
**Solution:**
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add missing variables
3. Redeploy: Deployments → Latest → Redeploy

### Issue: File upload fails with 413 error
**Solution:**
- Vercel has 4.5MB limit for serverless functions
- Reduce image size before upload
- Or use client-side compression

### Issue: Function timeout (10s limit)
**Solution:**
- Optimize file upload process
- Use streaming for large files
- Consider upgrading Vercel plan for longer timeout

### Issue: CORS errors
**Solution:**
- CORS headers already configured in `api/donations.js`
- If issues persist, check browser console for specific error
- Verify API endpoint URL is correct

## 💰 Pricing

### Vercel Free Tier Includes:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless functions (100GB-hours)
- ✅ Automatic SSL
- ✅ Preview deployments

### Vercel Blob:
- ✅ Free tier: 500MB storage
- ✅ $0.15/GB/month after free tier
- ✅ Unlimited bandwidth

### Vercel KV:
- ✅ Free tier: 256MB storage, 3000 commands/day
- ✅ Pro: $1/month for 1GB, 100K commands/day

**For this donation website:**
- Expected cost: **$0-5/month** (depending on traffic)
- Free tier should be sufficient for small-medium traffic

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Blob Docs](https://vercel.com/docs/storage/vercel-blob)
- [Vercel KV Docs](https://vercel.com/docs/storage/vercel-kv)
- [Vercel Functions Docs](https://vercel.com/docs/functions)

## ✅ Deployment Checklist

- [ ] Vercel account created
- [ ] Blob storage created
- [ ] KV storage created
- [ ] Environment variables configured
- [ ] Code pushed to GitHub
- [ ] Project imported to Vercel
- [ ] Storage connected to project
- [ ] Initial deployment successful
- [ ] Health endpoint working
- [ ] Donations endpoint working
- [ ] File upload tested
- [ ] Data migration completed (if needed)
- [ ] Custom domain configured (optional)
- [ ] Monitoring setup

---

🎉 **Congratulations!** Your donation website is now live on Vercel!

For support, contact: ultrassmekda@gmail.com
