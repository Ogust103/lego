const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = 'lego';

let db;
const connect = async () => {
  if (!db) {
    const client = await MongoClient.connect(MONGODB_URI);
    db = client.db(MONGODB_DB_NAME);
  }
  return db;
};

// Middleware CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Routes
app.get('/deals/search', async (req, res) => {
  const db = await connect();
  const deals = await db.collection('deals').find().limit(100).toArray();
  res.json({ results: deals }); // ou directement res.json(deals);
});


app.get('/sales/search', async (req, res) => {
  try {
    const db = await connect();
    const collection = db.collection('sales');

    const legoSetId = req.query.legoSetId;

    const query = legoSetId ? { legoSetId: parseInt(legoSetId) } : {};

    const sales = await collection
      .find(query)
      .sort({ published: -1 })
      .limit(12)
      .toArray();

    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/deals/:id', async (req, res) => {
  try {
    const db = await connect();
    const collection = db.collection('deals');
    const deal = await collection.findOne({ legoId: parseInt(req.params.id) });

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    res.json(deal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export pour Vercel
module.exports = (req, res) => app(req, res);
