# ⚡ Quick Start Guide

Panduan cepat untuk menjalankan dan deploy website donasi.

## 🚀 5 Menit Setup

### 1. Clone & Install (1 menit)
```bash
git clone <repository-url>
cd donasi-website
npm install
```

### 2. Setup Vercel Account (2 menit)
1. Buat akun di [vercel.com](https://vercel.com/signup)
2. Buat **Blob Storage** di [Storage Dashboard](https://vercel.com/dashboard/stores)
3. Buat **KV Storage** di [Storage Dashboard](https://vercel.com/dashboard/stores)
4. Copy semua credentials

### 3. Configure Environment (1 menit)
```bash
cp .env.example .env.local
```

Edit `.env.local` dan paste credentials dari Step 2.

### 4. Deploy (1 menit)
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Done! 🎉 Website Anda sudah live!

## 🧪 Test Locally

```bash
# Pull environment variables dari Vercel
vercel env pull .env.local

# Run dengan serverless functions
vercel dev
```

Buka: `http://localhost:3000`

## 📝 Next Steps

1. **Setup Custom Domain** (Optional)
   - Vercel Dashboard → Project → Settings → Domains
   - Add your domain
   - Configure DNS

2. **Migrate Existing Data** (If any)
   ```bash
   node scripts/migrate-data.js
   ```

3. **Monitor**
   - View logs: Vercel Dashboard → Project → Logs
   - Check storage: Vercel Dashboard → Storage

## 🆘 Need Help?

- 📖 Full guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 📚 Documentation: [README.md](./README.md)
- 🐛 Issues: Check [Troubleshooting](./DEPLOYMENT.md#-troubleshooting)
- 📧 Contact: ultrassmekda@gmail.com

## 🎯 Common Commands

```bash
# Development
npm run dev              # Frontend only
vercel dev              # With serverless functions

# Build
npm run build           # Build for production

# Deploy
vercel                  # Deploy to preview
vercel --prod          # Deploy to production

# Environment
vercel env pull        # Pull env variables
vercel env add         # Add new env variable

# Logs
vercel logs            # View function logs
```

## ✅ Checklist

- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] Vercel account created
- [ ] Blob & KV storage created
- [ ] Environment variables configured
- [ ] Deployed to Vercel
- [ ] Tested donation form
- [ ] File upload working

---

Made with ❤️ by ULTRAS SMEKDA
