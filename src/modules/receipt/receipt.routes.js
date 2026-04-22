const { Router } = require('express');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { uploadReceiptMiddleware } = require('./receipt.upload');
const { ReceiptController } = require('./receipt.controller');

const router = Router();
const receiptController = new ReceiptController();

router.post(
  '/extract',
  authMiddleware,
  uploadReceiptMiddleware,
  receiptController.extract
);

module.exports = router;
