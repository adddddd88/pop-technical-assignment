require('dotenv').config();

const { createApp } = require('./app');
const { connectDatabase } = require('./utils/database');
const { getRedisClient } = require('./utils/redis');
const { logger } = require('./utils/logger');

const PORT = process.env.PORT || 3000;

const init = async () => {
  await connectDatabase();
  getRedisClient(); 

  const app = createApp();

  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`, {
      port: PORT,
      env: process.env.NODE_ENV,
    });
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', { reason });
  });
};

init().catch((err) => {
  logger.error('Failed to start server', { error: err.message });
  process.exit(1);
});
