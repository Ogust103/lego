const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'lego';

async function connectToDb() {
  const client = await MongoClient.connect(MONGODB_URI);
  return client.db(DB_NAME);
}

// 1. Best discount deals
async function findBestDiscountDeals() {
  const db = await connectToDb();
  return db.collection('sales')
    .find({ discount: { $ne: null } })
    .sort({ discount: -1 })
    .toArray();
}

// 2. Most commented deals
async function findMostCommentedDeals() {
  const db = await connectToDb();
  return db.collection('deals')
    .find({ comments: { $exists: true } })
    .sort({ comments: -1 })
    .toArray();
}

// 3. Deals sorted by price (lowest first)
async function findDealsSortedByPrice() {
  const db = await connectToDb();
  return db.collection('deals')
    .find({ price: { $ne: null } })
    .sort({ price: 1 })
    .toArray();
}

// 4. Deals sorted by date (assuming `postDate` is a Date string or timestamp)
async function findDealsSortedByDate() {
  const db = await connectToDb();
  return db.collection('deals')
    .find({})
    .sort({ postDate: -1 })
    .toArray();
}

// 5. Sales for a given LEGO set ID
async function findSalesByLegoSetId(legoSetId) {
  const db = await connectToDb();
  return db.collection('sales')
    .find({ id: parseInt(legoSetId) })
    .toArray();
}

// 6. Sales scraped less than 3 weeks ago
async function findRecentSales() {
  const db = await connectToDb();
  const now = new Date();
  const threeWeeksAgo = new Date(now.setDate(now.getDate() - 21));

  return db.collection('sales')
    .find({ scrapedAt: { $gte: threeWeeksAgo } })
    .toArray();
}
async function checkSampleData() {
    const db = await connectToDb();
    const dealsSample = await db.collection('deals').findOne();
    const salesSample = await db.collection('sales').findOne();
  
    console.log("Sample deal:", dealsSample);
    console.log("Sample sale:", salesSample);
  }
  checkSampleData();
// Exemple de test
async function runAllQueries() {
  console.log("Best discounts:", await findBestDiscountDeals());
  console.log("Most commented:", await findMostCommentedDeals());
  console.log("Sorted by price:", await findDealsSortedByPrice());
  console.log("Sorted by date:", await findDealsSortedByDate());
  console.log("Sales for ID 42156:", await findSalesByLegoSetId("42156"));
  console.log("Recent sales (<3 weeks):", await findRecentSales());
}

runAllQueries();
