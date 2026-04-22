const { logger } = require('../utils/logger');
const { sendError } = require('../utils/response');

/**
 * Global error handler — must have 4 params for Express to recognise it
 * @type {import('express').ErrorRequestHandler}
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  sendError(res, 'INTERNAL_SERVER_ERROR', 'An unexpected error occurred', 500);
};

/** @type {import('express').RequestHandler} */
const notFoundHandler = (req, res) => {
  sendError(res, 'NOT_FOUND', `Route ${req.method} ${req.path} not found`, 404);
};

module.exports = { errorHandler, notFoundHandler };
