/* eslint-disable no-console, no-process-exit */
const fs = require('fs');
const path = require('path');

const websites = {
  "avenuedelabrique" : "https://www.avenuedelabrique.com/nouveautes-lego",
  "dealabs" : "https://www.dealabs.com/groupe/lego",
  "vinted" : `https://www.vinted.fr/catalog?search_text=`,
}

async function sandbox(website, name) {
  try {
    const site = require('./websites/' + website);
    const url = websites[website] + name;
    console.log(`🕵️‍♀️  browsing ${url} website`);

    const deals = await site.scrape(url);

    console.log(deals);

    const outputPath = path.join(__dirname, 'deals.json');

    fs.writeFileSync(outputPath, JSON.stringify(deals, null, 2), 'utf-8');

    console.log(`Fichier JSON sauvegardé dans ${outputPath}`);
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,, eshop, id = ""] = process.argv;

sandbox(eshop, id);
