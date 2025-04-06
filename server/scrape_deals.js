const { scrape } = require('./websites/dealabs');
const { insertDeals, close } = require('./db/mongo');

const main = async () => {
  const url = 'https://www.dealabs.com/groupe/lego';
  const deals = await scrape(url);

  if (deals) {
    console.log(`Scraped ${deals.length} deals`);
    await insertDeals(deals);
    console.log('Deals inserted into MongoDB');
  } else {
    console.log('No deals found.');
  }

  await close();
};

main().catch(err => {
  console.error('An error occurred:', err);
  close(); // Ferme la connexion même en cas d'erreur
  process.exit(1);
});
