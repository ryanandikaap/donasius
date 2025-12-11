#!/bin/bash

# Script to add environment variables to Vercel
# Run this after 'vercel link'

echo "🔧 Setting up Vercel Environment Variables..."
echo ""

# Blob Storage Token
echo "📦 Adding BLOB_READ_WRITE_TOKEN..."
echo "vercel_blob_rw_vOmYNvvybSKSJ3DI_iW28D6pnS3STnRyfui93kINHKGHyQ7" | vercel env add BLOB_READ_WRITE_TOKEN production preview development

# KV REST API URL
echo "🔑 Adding KV_REST_API_URL..."
echo "https://welcome-grouse-9552.upstash.io" | vercel env add KV_REST_API_URL production preview development

# KV REST API Token
echo "🔑 Adding KV_REST_API_TOKEN..."
echo "ASVQAAImcDE5OTY2OTY1NGJ1YTE0NDI2OGU5MjhjMGUyY2FhNGY3MHAxOTU1Mg" | vercel env add KV_REST_API_TOKEN production preview development

# KV REST API Read Only Token
echo "🔑 Adding KV_REST_API_READ_ONLY_TOKEN..."
echo "AiVQAAIgcDGAlNQE0fA9LMnIVIb3eFxc6FT6qYaWQzR-2B-xROwRQQ" | vercel env add KV_REST_API_READ_ONLY_TOKEN production preview development

echo ""
echo "✅ All environment variables added!"
echo ""
echo "Next steps:"
echo "1. Run: vercel --prod"
echo "2. Connect storage in Vercel Dashboard"
echo "3. Test your deployment"
