// client/v2/portfolio.js

const API_BASE = 'https://legotracker-ta9rrjcmu-ogust1s-projects.vercel.app'; 

const fetchDeals = async () => {
  try {
    const response = await fetch(`${API_BASE}/deals/search?limit=100`);
    const { results: deals = [] } = await response.json();

    // Pour chaque deal avec un legoId, récupérer les ventes Vinted et calculer l'écart de prix
    const scoredDeals = await Promise.all(
      deals.map(async (deal) => {
        if (!deal.legoId || deal.price == null) return { ...deal, score: -Infinity };

        try {
          const res = await fetch(`${API_BASE}/sales/search?legoSetId=${deal.legoId}`);
          const data = await res.json();
          const sales = data.results || data; // supporte les deux formats

          if (!sales.length) return { ...deal, score: -Infinity };

          const average = sales.reduce((acc, s) => acc + parseFloat(s.price), 0) / sales.length;
          const score = average - deal.price;

          return { ...deal, score: parseFloat(score.toFixed(2)), average: average.toFixed(2) };
        } catch (err) {
          return { ...deal, score: -Infinity };
        }
      })
    );

    // Trier par score décroissant
    const sortedDeals = scoredDeals.filter(d => d.score !== -Infinity).sort((a, b) => b.score - a.score);
    displayDeals(sortedDeals);

  } catch (err) {
    console.error('Erreur lors de la récupération des deals:', err);
  }
};

const displayDeals = (deals) => {
  const container = document.getElementById('deals-container');
  container.innerHTML = '';

  deals.forEach(deal => {
    const card = document.createElement('div');
    card.className = 'deal-card';

    const isHot = deal.temperature && deal.temperature > 100;
    const isHugeDiscount = deal.discount && deal.discount >= 40;

    card.innerHTML = `
      <img src="${deal.img}" alt="${deal.title}" class="deal-img" />
      <h3>${deal.title}</h3>
      <p><strong>Prix :</strong> ${deal.price} €</p>
      <p><strong>Remise :</strong> ${deal.discount || 0}%</p>
      <p><strong>Température :</strong> ${deal.temperature || 0}°</p>
      ${deal.average ? `<p><strong>Prix moyen Vinted :</strong> ${deal.average} €</p>` : ''}
      ${typeof deal.score === 'number' ? `<p><strong>Gain potentiel :</strong> ${deal.score} €</p>` : ''}
      ${isHugeDiscount ? '<span class="badge">💰 Super deal</span>' : ''}
      ${isHot ? '<span class="badge hot">🔥 Hot</span>' : ''}
      <a href="${deal.link}" class="deal-link" target="_blank">Voir le deal</a>
    `;

    container.appendChild(card);
  });
};

// Au chargement de la page
window.onload = fetchDeals;
