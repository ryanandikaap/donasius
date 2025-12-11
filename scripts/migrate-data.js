/**
 * Data Migration Script
 * Migrate data from backend/donations.json to Vercel KV format
 * 
 * Usage:
 * 1. Make sure you have Vercel KV setup
 * 2. Set environment variables (KV_REST_API_URL, KV_REST_API_TOKEN)
 * 3. Run: node scripts/migrate-data.js
 */

const fs = require('fs');
const path = require('path');

// Read existing donations
const donationsPath = path.join(__dirname, '../backend/donations.json');
let donations = [];

try {
  if (fs.existsSync(donationsPath)) {
    const data = fs.readFileSync(donationsPath, 'utf8');
    donations = JSON.parse(data);
    console.log(`✅ Found ${donations.length} donations to migrate`);
  } else {
    console.log('⚠️  No donations.json found, starting with empty array');
  }
} catch (error) {
  console.error('❌ Error reading donations.json:', error);
  process.exit(1);
}

// Output migration data
console.log('\n📋 Migration Data:');
console.log(JSON.stringify(donations, null, 2));

console.log('\n📝 Instructions:');
console.log('1. Go to Vercel Dashboard > Storage > KV');
console.log('2. Create a new KV store or select existing one');
console.log('3. In the KV store, create a key named "donations"');
console.log('4. Paste the JSON data above as the value');
console.log('\nOr use Vercel CLI:');
console.log('vercel env pull .env.local');
console.log('Then run this script with KV credentials');

// If KV credentials are available, attempt automatic migration
if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  console.log('\n🔄 Attempting automatic migration...');
  
  const { kv } = require('@vercel/kv');
  
  kv.set('donations', donations)
    .then(() => {
      console.log('✅ Migration successful!');
      console.log(`Migrated ${donations.length} donations to Vercel KV`);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      console.log('Please migrate manually using the instructions above');
    });
} else {
  console.log('\n⚠️  KV credentials not found in environment');
  console.log('Please set KV_REST_API_URL and KV_REST_API_TOKEN');
  console.log('Or migrate manually using the instructions above');
}
