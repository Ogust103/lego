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

app.get('/deals/search', async (req, res) => {
  const db = await connect();
  const deals = await db.collection('deals').find().limit(12).toArray();
  res.json(deals);
});

// handler exporté pour Vercel
module.exports = app;
