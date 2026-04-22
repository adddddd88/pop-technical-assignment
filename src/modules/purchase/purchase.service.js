const { EnterpriseRepository } = require('../enterprise/enterprise.repository');
const { getPointsAwardQueue } = require('../queue/points.queue');
const { calculatePoints } = require('./purchase.calculator');
const { logger } = require('../../utils/logger');

class PurchaseService {
  constructor() {
    this.enterpriseRepository = new EnterpriseRepository();
  }


  async processPurchase({ enterpriseId, clientId, amount, category }) {
    const enterprise = await this.enterpriseRepository.findActiveById(enterpriseId);

    if (!enterprise) {
      const err = new Error(`Enterprise not found or inactive: ${enterpriseId}`);
      err.code = 'ENTERPRISE_NOT_FOUND';
      throw err;
    }

    const { loyaltyConfig } = enterprise;

    if (loyaltyConfig.mode === 'category' && !category) {
      const err = new Error(
        'This enterprise uses category-based loyalty. A "category" field is required.'
      );
      err.code = 'MISSING_CATEGORY';
      throw err;
    }

    const points = calculatePoints(amount, loyaltyConfig, category);

    logger.info('Points calculated', {
      enterpriseId,
      clientId,
      amount,
      mode: loyaltyConfig.mode,
      points,
    });

    const queue = getPointsAwardQueue();

    const jobId = `${enterpriseId}_${clientId}_${amount}_${Math.floor(Date.now() / 60_000)}`;

    const job = await queue.add(
      'points-award',
      {
        enterpriseId,
        clientId,
        points,
        purchaseAmount: amount,
        enqueuedAt: new Date().toISOString(),
      },
      { jobId }
    );

    logger.info('Points award job queued', { jobId: job.id, enterpriseId, clientId, points });

    return {
      points,
      enterpriseId,
      clientId,
      amount,
      loyaltyMode: loyaltyConfig.mode,
      jobId: job.id,
    };
  }
}

module.exports = { PurchaseService };