const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const parse = data => {
  const $ = cheerio.load(data);

  return $('div.threadListCard.thread-clickRoot')
    .map((i, element) => {
      const $element = $(element);

      const price = parseFloat(
        $element
          .find('.thread-price')
          .first()
          .text()
          .trim()
          .replace("€", "")
          .replace(",", ".")
      ) || null;

      const oldPrice = parseFloat(
        $element
          .find('.text--lineThrough')
          .first()
          .text()
          .trim()
          .replace("€", "")
          .replace(",", ".")
      ) || null;

      const discount = parseInt(
        $element
          .find('.textBadge--green')
          .first()
          .text()
          .trim()
          .replace("-", "")
          .replace("%", "")
      ) || null;

      const img = $element.find('.threadListCard-image img').attr('src');
      const title = $element.find('a.js-thread-title').attr('title') || $element.find('a.js-thread-title').text().trim();
      const link = $element.find('a.js-thread-title').attr('href');
      const fullLink = link?.startsWith('http') ? link : `https://www.dealabs.com${link}`;

      const legoIDMatch = title.match(/\b\d{4,6}\b/);
      const legoId = legoIDMatch ? parseInt(legoIDMatch[0]) : null;

      const dealabsIDMatch = link?.match(/(\d{6,})/);
      const dealabsID = dealabsIDMatch ? parseInt(dealabsIDMatch[1]) : null;

      const temperature = parseInt(
        $element
          .find('.overflow--wrap-off')
          .first()
          .text()
          .trim()
          .replace("°", "")
      ) || null;

      const postDate = $element
        .find('.chip .size--all-s')
        .first()
        .text()
        .trim() || null;

      const comments = parseInt(
        $(element)
          .find('.icon--comments')
          .parent()
          .text()
          .trim()
      ) || null;

      return {
        discount,
        price,
        oldPrice,
        legoId,
        img,
        title,
        link: fullLink,
        dealabsID,
        temperature,
        postDate,
        comments
      };
    })
    .get();
};

module.exports.scrape = async url => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    );

    let allResults = [];
    let currentPage = 1;
    let keepGoing = true;

    while (keepGoing) {
      const pageUrl = `${url}?page=${currentPage}`;
      console.log(`Scraping page ${currentPage}: ${pageUrl}`);

      try {
        await page.goto(pageUrl, { waitUntil: 'networkidle2' });
        const html = await page.content();
        const results = parse(html);

        if (results.length === 0) {
          // Si aucune donnée n'est trouvée, on arrête
          console.log(`Page ${currentPage} is empty, stopping.`);
          keepGoing = false;
        } else {
          allResults = allResults.concat(results);
          currentPage++;
          // Délai pour éviter de surcharger le serveur
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        // Si une erreur survient (ex. 404), on arrête
        console.log(`Page ${currentPage} failed with error: ${error.message}, stopping.`);
        keepGoing = false;
      }
    }

    await browser.close();
    return allResults;

  } catch (err) {
    console.error('Scrape error:', err);
    return null;
  }
};