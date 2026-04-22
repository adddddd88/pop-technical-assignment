const { sendError } = require('../utils/response');

/**
 * Middleware factory — wraps any Zod schema into an Express middleware.
 * @param {import('zod').ZodTypeAny} schema
 * @returns {import('express').RequestHandler}
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    return sendError(res, 'VALIDATION_ERROR', 'Invalid request body', 400, details);
  }

  req.body = result.data;
  next();
};

module.exports = { validate };