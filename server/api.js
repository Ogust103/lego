const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8092;

const uri = process.env.MONGODB_URI;
const dbName = 'lego';

let db;
const connect = async () => {
  if (!db) {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    db = client.db(dbName);
  }
  return db;
};

app.use(cors());
app.use(express.json());

// ➤ Check API status
app.get('/', (req, res) => {
  res.json({ status: '✅ API is running' });
});

// ➤ GET /deals/:id
app.get('/deals/:id', async (req, res) => {
  const db = await connect();
  const deal = await db.collection('deals').findOne({ _id: new ObjectId(req.params.id) });
  res.json(deal);
});

// ➤ GET /deals/search
app.get('/deals/search', async (req, res) => {
  const db = await connect();
  const {
    limit = 12,
    price,
    date,
    filterBy
  } = req.query;

  const query = {};

  if (price) {
    query.price = { $lte: parseFloat(price) };
  }

  if (filterBy === 'best-discount') {
    query.discount = { $gte: 50 };
  }

  if (filterBy === 'most-commented') {
    query.comments = { $gte: 15 };
  }

  if (filterBy === 'hot-deals') {
    query.temperature = { $gte: 100 };
  }

  if (date) {
    const timestamp = new Date(date).getTime() / 1000;
    query.published = { $gte: timestamp };
  }

  const results = await db.collection('deals')
    .find(query)
    .sort({ price: 1 })
    .limit(parseInt(limit))
    .toArray();

  res.json({ limit: parseInt(limit), total: results.length, results });
});

// ➤ GET /sales/search
app.get('/sales/search', async (req, res) => {
  const db = await connect();
  const {
    limit = 12,
    legoSetId
  } = req.query;

  const query = {};
  if (legoSetId) query.legoSetId = parseInt(legoSetId);

  const results = await db.collection('sales')
    .find(query)
    .sort({ published: -1 })
    .limit(parseInt(limit))
    .toArray();

  res.json({ limit: parseInt(limit), total: results.length, results });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API is running on http://localhost:${PORT}`);
});
