// server/api.js
const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const { close } = require('./db/mongo');

const PORT = process.env.PORT || 8092;
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = 'lego';

const app = express();
let db;

// Connexion MongoDB
const connect = async () => {
  if (!db) {
    const client = await MongoClient.connect(MONGODB_URI);
    db = client.db(MONGODB_DB_NAME);
  }
  return db;
};

// Route : GET /deals/:id
app.get('/deals/:id', async (req, res) => {
  try {
    const db = await connect();
    const collection = db.collection('deals');
    const deal = await collection.findOne({ legoId: parseInt(req.params.id) });
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    res.json(deal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route : GET /deals/search
app.get('/deals/search', async (req, res) => {
  try {
    const db = await connect();
    const collection = db.collection('deals');

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

    if (date) {
      const timestamp = new Date(date).getTime() / 1000;
      query.published = { $gte: timestamp };
    }

    if (filterBy === 'best-discount') {
      query.discount = { $gte: 50 };
    } else if (filterBy === 'most-commented') {
      query.comments = { $gte: 15 };
    } else if (filterBy === 'hot-deals') {
      query.temperature = { $gte: 100 };
    }

    const deals = await collection
      .find(query)
      .sort({ price: 1 })
      .limit(parseInt(limit))
      .toArray();

    res.json({
      limit: parseInt(limit),
      total: deals.length,
      results: deals
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route : GET /sales/search
app.get('/sales/search', async (req, res) => {
  try {
    const db = await connect();
    const collection = db.collection('sales');

    const {
      limit = 12,
      legoSetId
    } = req.query;

    const query = {};
    if (legoSetId) {
      query.legoSetId = legoSetId;
    }

    const sales = await collection
      .find(query)
      .sort({ published: -1 })
      .limit(parseInt(limit))
      .toArray();

    res.json({
      limit: parseInt(limit),
      total: sales.length,
      results: sales
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`📦 LEGO API listening on http://localhost:${PORT}`);
});

// Fermer proprement MongoDB à l’arrêt du serveur
process.on('SIGINT', async () => {
  console.log('\n🛑 SIGINT received. Closing MongoDB connection...');
  await close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received. Closing MongoDB connection...');
  await close();
  process.exit(0);
});
