#!/bin/bash

# Test script for Vercel deployment
# Usage: ./scripts/test-endpoints.sh <your-vercel-url>

if [ -z "$1" ]; then
    echo "❌ Error: Please provide Vercel URL"
    echo "Usage: ./scripts/test-endpoints.sh https://your-domain.vercel.app"
    exit 1
fi

URL=$1
echo "🧪 Testing Vercel Deployment: $URL"
echo "================================================"
echo ""

# Test 1: Health Check
echo "📍 Test 1: Health Check Endpoint"
echo "GET $URL/api/health"
curl -s "$URL/api/health" | jq '.'
echo ""
echo "✅ Expected: status: ok"
echo ""

# Test 2: Get Donations (should be empty initially)
echo "📍 Test 2: Get Donations Endpoint"
echo "GET $URL/api/donations"
curl -s "$URL/api/donations" | jq '.'
echo ""
echo "✅ Expected: [] (empty array)"
echo ""

# Test 3: Get Total
echo "📍 Test 3: Get Total Donations"
echo "GET $URL/api/total"
curl -s "$URL/api/total" | jq '.'
echo ""
echo "✅ Expected: total: 0, count: 0"
echo ""

echo "================================================"
echo "🎉 Basic endpoint tests completed!"
echo ""
echo "Next steps:"
echo "1. Open $URL in browser"
echo "2. Test donation form submission"
echo "3. Test file upload"
echo "4. Verify data persistence"
