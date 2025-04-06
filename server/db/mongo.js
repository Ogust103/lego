const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = 'lego';

let client;
let db;

const connect = async () => {
  if (!client) {
    client = await MongoClient.connect(MONGODB_URI);
    db = client.db(MONGODB_DB_NAME);
  }
  return db;
};

const insertDeals = async deals => {
  const db = await connect();
  const collection = db.collection('deals');

  await collection.deleteMany({});

  if (deals.length) {
    await collection.insertMany(deals);
  }
};

const insertSales = async (legoSetId, sales) => {
  const db = await connect();
  const collection = db.collection('sales');
  await collection.deleteMany({ legoSetId });
  const docs = sales.map(sale => ({ ...sale, legoSetId }));
  if (docs.length) {
    await collection.insertMany(docs);
  }
};

module.exports = {
  insertDeals,
  insertSales
};
