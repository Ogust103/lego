const { MongoClient } = require('mongodb');
const { execSync } = require('child_process');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = 'lego';

const connect = async () => {
  const client = await MongoClient.connect(MONGODB_URI);
  return client.db(MONGODB_DB_NAME);
};

const main = async () => {
  const db = await connect();
  const dealsCollection = db.collection('deals');

  const legoIds = await dealsCollection.distinct('legoId', { legoId: { $ne: null } });

  console.log(`🔍 Found ${legoIds.length} unique LEGO IDs.`);

  for (const legoId of legoIds) {
    console.log(`🧱 Running scrape_sale.js for LEGO ID: ${legoId}`);
    try {
      // Exécute "node scrape_sales.js <legoId>" en bloquant (synchronously)
      execSync(`node scrape_sale.js ${legoId}`, { stdio: 'inherit' });
    } catch (error) {
      console.error(`❌ Failed to scrape sales for ${legoId}:`, error.message);
    }
  }

  console.log('🎉 All LEGO sales scraping finished.');
  process.exit(0);
};

main();
