require('dotenv').config();

const { Worker } = require('bullmq');
const { getRedisClient } = require('../utils/redis');
const { connectDatabase } = require('../utils/database');
const { ClientRepository } = require('../modules/client/client.repository');
const { logger } = require('../utils/logger');
const { QUEUE_NAMES } = require('../modules/queue/points.queue');

const clientRepository = new ClientRepository();

const processPointsAward = async (job) => {
  const { enterpriseId, clientId, points, purchaseAmount, enqueuedAt } = job.data;

  logger.info('Processing points award job', {
    jobId: job.id,
    attemptsMade: job.attemptsMade,
    enterpriseId,
    clientId,
    points,
  });

  await clientRepository.findOrCreateLoyaltyAccount(clientId, enterpriseId);

  const updated = await clientRepository.incrementPoints(clientId, enterpriseId, points);

  if (!updated) {
    throw new Error(`Loyalty account not found after upsert: clientId=${clientId}`);
  }

  logger.info('Points award job completed', {
    jobId: job.id,
    enterpriseId,
    clientId,
    pointsAwarded: points,
    newBalance: updated.pointsBalance,
    purchaseAmount,
    enqueuedAt,
  });

  logger.info('[NOTIFICATION] notification would be sent here', {
    clientId,
    enterpriseId,
    pointsAwarded: points,
    newBalance: updated.pointsBalance,
  });

  return { pointsAwarded: points, newBalance: updated.pointsBalance };
};

const startWorker = async () => {
  await connectDatabase();

  const worker = new Worker(QUEUE_NAMES.POINTS_AWARD, processPointsAward, {
    connection: getRedisClient(),
    concurrency: 10,
  });

  worker.on('completed', (job, result) => {
    logger.info('Job completed successfully', { jobId: job.id, result });
  });

  worker.on('failed', (job, err) => {
    const isFinal = job.attemptsMade >= job.opts.attempts;
    logger.error('Job failed', {
      jobId: job?.id,
      attemptsMade: job?.attemptsMade,
      maxAttempts: job?.opts?.attempts,
      isFinalFailure: isFinal,
      error: err.message,
      jobData: job?.data,
    });
  });

  worker.on('error', (err) => logger.error('Worker error', { error: err.message }));
  worker.on('stalled', (jobId) => logger.warn('Job stalled', { jobId }));

  logger.info('Points award worker started', { queue: QUEUE_NAMES.POINTS_AWARD });

  const shutdown = async (signal) => {
    logger.info(`${signal} received — closing worker`);
    await worker.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startWorker().catch((err) => {
  logger.error('Failed to start worker', { error: err.message });
  process.exit(1);
});