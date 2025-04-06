module.exports.isProfitable = (deal, sales) => {
    if (!sales?.length) return false;
  
    const prices = sales.map(s => s.price).filter(Boolean);
    if (!prices.length) return false;
  
    const median = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)];
  
    return median > deal.price; // profitable si revendable + cher
  };
  