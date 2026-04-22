
const calculateLinear = (amount, config) => {
  return Math.floor(amount * config.pointsPerMAD);
};

const calculateCategory = (amount, category, config) => {
  if (!category) {
    return Math.floor(amount * config.defaultPointsPerMAD);
  }

  const normalised = category.toLowerCase().trim();
  const match = config.rates.find((r) => r.category === normalised);
  const rate = match ? match.pointsPerMAD : config.defaultPointsPerMAD;

  return Math.floor(amount * rate);
};

const calculateRange = (amount, config) => {
  const sorted = [...config.tiers].sort((a, b) => a.minAmount - b.minAmount);

  const matched = sorted.find((tier) => {
    const aboveMin = amount >= tier.minAmount;
    const belowMax = tier.maxAmount === null || amount < tier.maxAmount;
    return aboveMin && belowMax;
  });

  if (!matched) return 0;

  return Math.floor(amount * matched.pointsPerMAD);
};

const calculatePoints = (amount, config, category) => {
  switch (config.mode) {
    case 'linear':
      return calculateLinear(amount, config);

    case 'category':
      return calculateCategory(amount, category, config);

    case 'range':
      return calculateRange(amount, config);

    default:
      throw new Error(`Unknown loyalty mode: "${config.mode}"`);
  }
};

module.exports = {
  calculatePoints,
  calculateLinear,
  calculateCategory,
  calculateRange,
};
