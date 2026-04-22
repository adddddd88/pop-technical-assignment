/**
 * @param {import('express').Response} res
 * @param {*} data
 * @param {number} statusCode
 * @param {object} [meta]
 */
const sendSuccess = (res, data, statusCode = 200, meta) => {
  res.status(statusCode).json({ success: true, data, ...(meta && { meta }) });
};

/**
 * @param {import('express').Response} res
 * @param {string} code
 * @param {string} message
 * @param {number} statusCode
 * @param {*} [details]
 */
const sendError = (res, code, message, statusCode = 400, details) => {
  res.status(statusCode).json({
    success: false,
    error: { code, message, ...(details !== undefined && { details }) },
  });
};

module.exports = { sendSuccess, sendError };
