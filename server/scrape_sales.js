const { scrape } = require('./websites/vinted');
const { insertSales } = require('./db/mongo');

const legoSetId = process.argv[2]; // ex: node scrape_sales.js 42156

const main = async () => {
  if (!legoSetId) {
    console.error('Please provide a LEGO set ID (ex: node scrape_sales.js 42156)');
    process.exit(1);
  }

  const url = `https://www.vinted.fr/catalog?search_text=${legoSetId}`;
  const sales = await scrape(url);

  if (sales) {
    console.log(`Scraped ${sales.length} sales for set ID ${legoSetId}`);
    await insertSales(legoSetId, sales);
    console.log('Sales inserted into MongoDB (previous ones replaced)');
  } else {
    console.log('No sales found.');
  }
};

main();
