# 🚀 Step-by-Step Deployment & Testing Guide

## Current Status: Installing Vercel CLI...

Follow these steps untuk deploy dan test website donasi ke Vercel.

---

## Phase 1: Pre-Deployment Setup ✅ COMPLETED

- [x] Install dependencies (@vercel/blob, @vercel/kv, formidable)
- [x] Create serverless functions (api/health.js, api/donations.js, api/total.js)
- [x] Configure vercel.json
- [x] Create .env.example
- [x] Update .gitignore
- [x] Create documentation

---

## Phase 2: Vercel CLI Installation 🔄 IN PROGRESS

```bash
npm install -g vercel
```

**Wait for installation to complete...**

---

## Phase 3: Vercel Account & Storage Setup

### Step 1: Create Vercel Account (if not exists)
1. Go to https://vercel.com/signup
2. Sign up with GitHub/GitLab/Email
3. Verify email

### Step 2: Create Blob Storage
1. Login to https://vercel.com/dashboard
2. Click **Storage** in sidebar
3. Click **Create Database**
4. Select **Blob** → **Continue**
5. Name: `donasi-blob-storage`
6. Region: **Singapore** (closest to Indonesia)
7. Click **Create**
8. **COPY THIS:** `BLOB_READ_WRITE_TOKEN`

### Step 3: Create KV Storage
1. Still in Storage page
2. Click **Create Database** again
3. Select **KV** → **Continue**
4. Name: `donasi-kv-store`
5. Region: **Singapore**
6. Click **Create**
7. **COPY THESE:**
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

---

## Phase 4: Deploy to Vercel

### Step 1: Login to Vercel CLI
```bash
vercel login
```
- Follow browser prompt to authenticate

### Step 2: Link Project
```bash
vercel link
```
- Set up and deploy? **Y**
- Which scope? (select your account)
- Link to existing project? **N**
- Project name? `donasi-website`
- Directory? `./` (press Enter)

### Step 3: Add Environment Variables
```bash
vercel env add BLOB_READ_WRITE_TOKEN
# Paste token from Step 2 of Phase 3
# Select: Production, Preview, Development (all)

vercel env add KV_REST_API_URL
# Paste URL from Step 3 of Phase 3
# Select: Production, Preview, Development (all)

vercel env add KV_REST_API_TOKEN
# Paste token from Step 3 of Phase 3
# Select: Production, Preview, Development (all)
```

### Step 4: Deploy to Production
```bash
vercel --prod
```

**Wait for deployment...**

You'll get a URL like: `https://donasi-website-xxx.vercel.app`

---

## Phase 5: Connect Storage to Project

### Step 1: Go to Project Settings
1. Vercel Dashboard → Your Project → Settings

### Step 2: Connect Blob Storage
1. Go to **Storage** tab
2. Click **Connect Store**
3. Select `donasi-blob-storage`
4. Click **Connect**

### Step 3: Connect KV Storage
1. Still in **Storage** tab
2. Click **Connect Store** again
3. Select `donasi-kv-store`
4. Click **Connect**

### Step 4: Initialize KV Store
1. Go to Storage → `donasi-kv-store`
2. Click **Add Key**
3. Key: `donations`
4. Value: `[]`
5. Click **Save**

---

## Phase 6: Testing 🧪

### Test 1: Health Check Endpoint
```bash
curl https://your-domain.vercel.app/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Server backend berjalan",
  "timestamp": "2025-01-11T...",
  "environment": "production"
}
```

✅ **Pass** if you get this response
❌ **Fail** if you get error

### Test 2: Get Donations (Empty)
```bash
curl https://your-domain.vercel.app/api/donations
```

**Expected Response:**
```json
[]
```

✅ **Pass** if you get empty array
❌ **Fail** if you get error

### Test 3: Get Total Donations
```bash
curl https://your-domain.vercel.app/api/total
```

**Expected Response:**
```json
{
  "total": 0,
  "count": 0,
  "currency": "IDR"
}
```

✅ **Pass** if you get this response
❌ **Fail** if you get error

### Test 4: Frontend Access
1. Open browser: `https://your-domain.vercel.app`
2. Check if homepage loads
3. Click "Donasi Sekarang" button
4. Check if form page loads

✅ **Pass** if all pages load
❌ **Fail** if you get errors

### Test 5: Donation Form Submission

**Manual Test:**
1. Go to donation form
2. Fill in:
   - Amount: 50000
   - Name: Test User
   - Email: test@example.com
   - Payment method: Bank Transfer
   - Select bank: BCA
3. Upload a test image (< 4.5MB)
4. Submit form

**Expected:**
- ✅ Form submits successfully
- ✅ Success message appears
- ✅ Image uploaded to Vercel Blob
- ✅ Data saved to Vercel KV

**Verify:**
```bash
curl https://your-domain.vercel.app/api/donations
```

Should return array with 1 donation:
```json
[
  {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "amount": 50000,
    "proofImage": "https://...",
    ...
  }
]
```

### Test 6: File Upload Verification
1. Copy `proofImage` URL from Test 5
2. Open URL in browser
3. Check if image displays

✅ **Pass** if image loads
❌ **Fail** if 404 or error

### Test 7: Total Donations Update
```bash
curl https://your-domain.vercel.app/api/total
```

**Expected Response:**
```json
{
  "total": 50000,
  "count": 1,
  "currency": "IDR"
}
```

✅ **Pass** if total updated
❌ **Fail** if still 0

### Test 8: Anonymous Donation
1. Go to donation form
2. Check "Donasi sebagai Anonim"
3. Fill amount: 100000
4. Upload image
5. Submit

**Verify:**
```bash
curl https://your-domain.vercel.app/api/donations
```

Should show 2 donations, second one with name "Anonim"

### Test 9: Large File Upload (Edge Case)
1. Try uploading file > 4.5MB
2. Should show error message

✅ **Pass** if error shown
❌ **Fail** if accepts large file

### Test 10: Form Validation
1. Try submitting without amount
2. Try submitting without image
3. Try submitting without name (non-anonymous)

✅ **Pass** if validation errors shown
❌ **Fail** if form submits

---

## Phase 7: Performance Testing

### Test Response Times
```bash
# Health endpoint
time curl https://your-domain.vercel.app/api/health

# Donations endpoint
time curl https://your-domain.vercel.app/api/donations

# Total endpoint
time curl https://your-domain.vercel.app/api/total
```

**Expected:**
- Cold start: < 1s
- Warm: < 200ms

### Test Multiple Submissions
Submit 5-10 donations rapidly to test:
- Concurrent uploads
- Data consistency
- No race conditions

---

## Phase 8: Monitoring

### View Logs
1. Vercel Dashboard → Project → Logs
2. Filter by function: `api/donations`
3. Check for errors

### View Storage Usage
1. Vercel Dashboard → Storage
2. Check Blob storage usage
3. Check KV operations count

---

## 📊 Test Results Summary

Fill this after testing:

| Test | Status | Notes |
|------|--------|-------|
| Health Check | ⬜ | |
| Get Donations | ⬜ | |
| Get Total | ⬜ | |
| Frontend Access | ⬜ | |
| Form Submission | ⬜ | |
| File Upload | ⬜ | |
| Total Update | ⬜ | |
| Anonymous Donation | ⬜ | |
| Large File Rejection | ⬜ | |
| Form Validation | ⬜ | |

Legend: ✅ Pass | ❌ Fail | ⬜ Not Tested

---

## 🐛 Troubleshooting

### Issue: "Module not found: @vercel/kv"
**Solution:**
```bash
npm install @vercel/kv @vercel/blob formidable
git add package.json package-lock.json
git commit -m "Add dependencies"
git push
vercel --prod
```

### Issue: "BLOB_READ_WRITE_TOKEN is not defined"
**Solution:**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Add missing variables
3. Redeploy

### Issue: File upload fails
**Solution:**
- Check file size (< 4.5MB)
- Verify BLOB_READ_WRITE_TOKEN
- Check Vercel logs for errors

### Issue: Data not persisting
**Solution:**
- Verify KV store connected
- Check KV credentials
- Initialize `donations` key with `[]`

---

## ✅ Deployment Checklist

- [ ] Vercel CLI installed
- [ ] Vercel account created
- [ ] Blob storage created
- [ ] KV storage created
- [ ] Environment variables added
- [ ] Project deployed
- [ ] Storage connected
- [ ] KV initialized
- [ ] All tests passed
- [ ] No errors in logs

---

## 🎉 Success Criteria

Deployment is successful when:
- ✅ All API endpoints return correct responses
- ✅ Frontend loads without errors
- ✅ Donation form submits successfully
- ✅ Files upload to Blob storage
- ✅ Data persists in KV store
- ✅ No errors in Vercel logs
- ✅ Response times < 1s

---

**Current Phase:** Waiting for Vercel CLI installation to complete...

**Next Step:** Login to Vercel and start deployment process
