const express = require('express');
const cookieParser = require('cookie-parser');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const authRoutes = require('./modules/auth/auth.routes');
const purchaseRoutes = require('./modules/purchase/purchase.routes');
const receiptRoutes = require('./modules/receipt/receipt.routes');

const createApp = () => {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/purchases', purchaseRoutes);
  app.use('/api/receipts', receiptRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

module.exports = { createApp };
