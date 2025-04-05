/* eslint-disable no-console, no-process-exit */
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const websites = {
  "avenuedelabrique": "https://www.avenuedelabrique.com/nouveautes-lego",
  "dealabs": "https://www.dealabs.com/groupe/lego",
  "vinted": `https://www.vinted.fr/catalog?search_text=`,
};

async function connectToDb() {
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  return client.db('lego');
}

async function sandbox(website, name) {
  try {
    const site = require('./websites/' + website);
    const url = websites[website] + name;
    console.log(`🕵️‍♀️  browsing ${url} website`);

    const deals = await site.scrape(url);
    console.log(`${deals.length} résultats scrapés.`);

    // Sauvegarde locale (facultative)
    const outputPath = path.join(__dirname, 'deals.json');
    fs.writeFileSync(outputPath, JSON.stringify(deals, null, 2), 'utf-8');
    console.log(`Fichier JSON sauvegardé dans ${outputPath}`);

    // Connexion MongoDB
    const db = await connectToDb();
    const collectionName = website === "vinted" ? "sales" : "deals";
    const collection = db.collection(collectionName);

    // Création d’un index unique pour éviter les doublons
    await collection.createIndex({ id: 1 }, { unique: true });

    // Insertion des données avec gestion des doublons
    try {
      const result = await collection.insertMany(deals, { ordered: false });
      console.log(`${result.insertedCount} nouveaux documents ajoutés dans la collection "${collectionName}".`);
    } catch (e) {
      console.warn('Certains doublons ont été ignorés lors de l’insertion.');
    }

    console.log('Done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,, eshop, id = ""] = process.argv;
sandbox(eshop, id);
