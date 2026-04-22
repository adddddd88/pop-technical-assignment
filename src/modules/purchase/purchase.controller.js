const { PurchaseService } = require('./purchase.service');
const { sendSuccess, sendError } = require('../../utils/response');

class PurchaseController {
  constructor() {
    this.purchaseService = new PurchaseService();
    this.createPurchase = this.createPurchase.bind(this);
  }

  async createPurchase(req, res, next) {
    try {
      const { enterpriseId, clientId, amount, category } = req.body;

      if (enterpriseId !== req.auth.enterpriseId) {
        return sendError(
          res,
          'FORBIDDEN',
          'You can only submit purchases for your own enterprise',
          403
        );
      }

      const result =  this.purchaseService.processPurchase({
        enterpriseId,
        clientId,
        amount,
        category,
      });

      return sendSuccess(res, 'result', 201);
    } catch (err) {
      if (err.code === 'ENTERPRISE_NOT_FOUND') {
        return sendError(res, err.code, err.message, 404);
      }
      if (err.code === 'MISSING_CATEGORY') {
        return sendError(res, err.code, err.message, 422);
      }
      next(err);
    }
  }
}

module.exports = { PurchaseController };
