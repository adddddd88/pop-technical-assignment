
//100% vibe coded haha

const {
  calculatePoints,
  calculateLinear,
  calculateCategory,
  calculateRange,
} = require('../modules/purchase/purchase.calculator');

// ---------------------------------------------------------------------------
// LINEAR mode
// ---------------------------------------------------------------------------
describe('calculateLinear', () => {
  const config = { mode: 'linear', pointsPerMAD: 0.1 }; // 1 pt per 10 MAD

  test('awards correct points for a standard amount', () => {
    expect(calculateLinear(350, config)).toBe(35);
  });

  test('floors fractional points — never rounds up', () => {
    // 155 * 0.1 = 15.5 → should be 15, not 16
    expect(calculateLinear(155, config)).toBe(15);
  });

  test('awards 0 points for a zero amount', () => {
    expect(calculateLinear(0, config)).toBe(0);
  });

  test('handles very small pointsPerMAD (high spend required per point)', () => {
    const highThreshold = { mode: 'linear', pointsPerMAD: 0.01 }; // 1 pt per 100 MAD
    expect(calculateLinear(99, highThreshold)).toBe(0);
    expect(calculateLinear(100, highThreshold)).toBe(1);
  });

  test('handles a large amount correctly', () => {
    expect(calculateLinear(10_000, config)).toBe(1000);
  });
});

// ---------------------------------------------------------------------------
// CATEGORY mode
// ---------------------------------------------------------------------------
describe('calculateCategory', () => {
  const config = {
    mode: 'category',
    defaultPointsPerMAD: 0.1,
    rates: [
      { category: 'electronics', pointsPerMAD: 0.2 },
      { category: 'food', pointsPerMAD: 0.05 },
    ],
  };

  test('uses the matched category rate', () => {
    // electronics: 200 * 0.2 = 40
    expect(calculateCategory(200, 'electronics', config)).toBe(40);
  });

  test('is case-insensitive for category matching', () => {
    expect(calculateCategory(200, 'ELECTRONICS', config)).toBe(40);
    expect(calculateCategory(200, 'Electronics', config)).toBe(40);
  });

  test('falls back to default rate for unknown category', () => {
    // 'clothing' not in rates → default 0.1 → 200 * 0.1 = 20
    expect(calculateCategory(200, 'clothing', config)).toBe(20);
  });

  test('falls back to default rate when category is undefined', () => {
    expect(calculateCategory(200, undefined, config)).toBe(20);
  });

  test('falls back to default rate when category is empty string', () => {
    // empty string is falsy — treated same as missing
    expect(calculateCategory(200, '', config)).toBe(20);
  });

  test('floors fractional points', () => {
    // food: 15 * 0.05 = 0.75 → 0
    expect(calculateCategory(15, 'food', config)).toBe(0);
    // food: 21 * 0.05 = 1.05 → 1
    expect(calculateCategory(21, 'food', config)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// RANGE / TIER mode
// ---------------------------------------------------------------------------
describe('calculateRange', () => {
  const config = {
    mode: 'range',
    tiers: [
      { minAmount: 0,   maxAmount: 100,  pointsPerMAD: 0.1   }, // 1 pt / 10 MAD
      { minAmount: 100, maxAmount: 500,  pointsPerMAD: 0.125 }, // 1 pt / 8 MAD
      { minAmount: 500, maxAmount: null, pointsPerMAD: 0.2   }, // 1 pt / 5 MAD
    ],
  };

  test('matches the first tier for a low amount', () => {
    // 50 * 0.1 = 5
    expect(calculateRange(50, config)).toBe(5);
  });

  test('matches the second tier for a mid amount', () => {
    // 350 * 0.125 = 43.75 → 43
    expect(calculateRange(350, config)).toBe(43);
  });

  test('matches the open-ended last tier for a high amount', () => {
    // 600 * 0.2 = 120
    expect(calculateRange(600, config)).toBe(120);
  });

  test('treats the tier boundary as inclusive on the lower bound', () => {
    // exactly 100 should hit tier 2, not tier 1
    // 100 * 0.125 = 12.5 → 12
    expect(calculateRange(100, config)).toBe(12);
    // exactly 500 should hit tier 3
    // 500 * 0.2 = 100
    expect(calculateRange(500, config)).toBe(100);
  });

  test('floors fractional points', () => {
    // 99 * 0.1 = 9.9 → 9
    expect(calculateRange(99, config)).toBe(9);
  });

  test('returns 0 if amount is below the lowest tier minimum', () => {
    const configWithGap = {
      mode: 'range',
      tiers: [{ minAmount: 50, maxAmount: null, pointsPerMAD: 0.1 }],
    };
    expect(calculateRange(10, configWithGap)).toBe(0);
  });

  test('works correctly when tiers are supplied out of order', () => {
    // Tiers shuffled — calculator must sort them
    const shuffled = {
      mode: 'range',
      tiers: [
        { minAmount: 500, maxAmount: null, pointsPerMAD: 0.2   },
        { minAmount: 0,   maxAmount: 100,  pointsPerMAD: 0.1   },
        { minAmount: 100, maxAmount: 500,  pointsPerMAD: 0.125 },
      ],
    };
    expect(calculateRange(350, shuffled)).toBe(43);
  });
});

// ---------------------------------------------------------------------------
// Main dispatcher — calculatePoints
// ---------------------------------------------------------------------------
describe('calculatePoints dispatcher', () => {
  test('routes to linear correctly', () => {
    const config = { mode: 'linear', pointsPerMAD: 0.1 };
    expect(calculatePoints(200, config)).toBe(20);
  });

  test('routes to category correctly', () => {
    const config = {
      mode: 'category',
      defaultPointsPerMAD: 0.1,
      rates: [{ category: 'food', pointsPerMAD: 0.05 }],
    };
    expect(calculatePoints(200, config, 'food')).toBe(10);
  });

  test('routes to range correctly', () => {
    const config = {
      mode: 'range',
      tiers: [{ minAmount: 0, maxAmount: null, pointsPerMAD: 0.1 }],
    };
    expect(calculatePoints(100, config)).toBe(10);
  });

  test('throws for an unknown mode', () => {
    const config = { mode: 'unknown' };
    expect(() => calculatePoints(100, config)).toThrow('Unknown loyalty mode: "unknown"');
  });
});
