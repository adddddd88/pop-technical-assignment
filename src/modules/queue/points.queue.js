const { Queue } = require('bullmq');
const { getRedisClient } = require('../../utils/redis');

const QUEUE_NAMES = {
  POINTS_AWARD: 'points-award',
};

let pointsAwardQueue = null;

const getPointsAwardQueue = () => {
  if (pointsAwardQueue) return pointsAwardQueue;

  pointsAwardQueue = new Queue(QUEUE_NAMES.POINTS_AWARD, {
    connection: getRedisClient(),
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000, 
      },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 200 },
    },
  });

  return pointsAwardQueue;
};

module.exports = { getPointsAwardQueue, QUEUE_NAMES };
