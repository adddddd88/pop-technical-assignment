const { Router } = require('express');
const { PurchaseController } = require('./purchase.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { CreatePurchaseSchema } = require('./purchase.schema.zod');

const router = Router();
const purchaseController = new PurchaseController();

router.post('/', authMiddleware, validate(CreatePurchaseSchema), purchaseController.createPurchase);

module.exports = router;
