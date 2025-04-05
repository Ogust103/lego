/* eslint-disable no-console, no-process-exit */
const fs = require('fs');
const path = require('path');
// const site = require('./websites/avenuedelabrique');
const site = require('./websites/dealabs');

async function sandbox(website = 'https://www.avenuedelabrique.com/nouveautes-lego') {
  try {
    console.log(`🕵️‍♀️  browsing ${website} website`);

    const deals = await site.scrape(website);

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

const [,, eshop] = process.argv;

sandbox(eshop);
