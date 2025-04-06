const dealabs = require('./websites/dealabs');
const vinted = require('./websites/vinted');
const { insertDeals, insertSales } = require('./db/mongo');
const { isProfitable } = require('./analyze');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const run = async () => {
  console.log('📦 Scraping Dealabs...');
  const deals = await dealabs.scrape('https://www.dealabs.com/groupe/lego');
  console.log(`➡️ ${deals.length} deals scrappés`);

  const enrichedDeals = [];
  const allSales = [];
  
  for (const deal of deals) {
    if (!deal.id) continue;

    if (true) {
        console.log(`🔍 Searching Vinted sales for set ID ${deal.id}`);
        const url = `https://www.vinted.fr/catalog?search_text=lego%20${deal.id}`;
        const sales = await vinted.scrape(url);
        if (sales != null) {
            await delay(1500); // anti-bot protection
    
            const profitable = isProfitable(deal, sales);
            enrichedDeals.push({ ...deal, profitable });
            allSales.push(...sales.map(s => ({ ...s, legoSetId: deal.id })));
        }
    }
    

  }

  console.log('🧠 Inserting into MongoDB...');
  await insertDeals(enrichedDeals);
  await insertSales(allSales);

  console.log('✅ Done.');
};

run();
