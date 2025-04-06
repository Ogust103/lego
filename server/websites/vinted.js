const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const parse = data => {
  const $ = cheerio.load(data);

  return $('div[data-testid="grid-item"]').map((i, element) => {
    const $element = $(element);
    // Extracting the product ID
    const productId = parseInt(
      $element.find('.new-item-box__container').attr('data-testid')?.replace('product-item-id-', '')
    ) || null;

    // Extracting the name/title
    const title = $element
      .find('.new-item-box__overlay')
      .attr('title')
      ?.split(',')[0]
      .trim() || null;

    // Extracting the price (without protection)
    const price = parseFloat(
      $element
        .find('[data-testid$="--price-text"]')
        .text()
        .trim()
        .replace('€', '')
        .replace(',', '.')
    ) || null;

    // Extracting the price with buyer protection
    const priceWithProtection = parseFloat(
      $element
        .find('span.web_ui__Text__subtitle.web_ui__Text__clickable')
        .text()
        .trim()
        .replace('€', '')
        .replace(',', '.')
    ) || null;

    const likes = parseInt(
      $element
        .find('span.web_ui__Text__caption.web_ui__Text__left')
        .text()
        .trim()
    ) || 0;

    // Extracting the URL
    const link = $element.find('.new-item-box__overlay').attr('href');
    const fullLink = link?.startsWith('http') ? link : `https://www.vinted.fr${link}`;

    // Extracting the image URL
    const img = $element.find('img[data-testid$="--image--img"]').attr('src') || null;

    return {
      id: productId,
      name: title,
      price,
      priceWithProtection,
      likes,
      link: fullLink,
      img
    };
  }).get();
};

module.exports.scrape = async url => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    );
    await page.goto(url, { waitUntil: 'networkidle2' });
    try {
      await page.waitForSelector('div[data-testid="grid-item"]', { timeout: 10000 });
      const html = await page.content();
      await browser.close();
      return parse(html);
    } catch (error) {
      if (error.name === 'TimeoutError') {
        console.log("Le sélecteur n'a pas été trouvé");
        return null;
      }
    }
  } catch (err) {
    console.error('Scrape error:', err);
    return null;
  }
};