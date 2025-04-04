const avenuedelabrique = require('avenuedelabrique');

const deals = avenuedelabrique.scrape('https://www.avenuedelabrique.com/promotions-et-bons-plans-lego');

deals.forEach(deal => {
  console.log(deal.title);
})