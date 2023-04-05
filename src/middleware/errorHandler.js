/**
 * Middleware function that wraps route handlers to catch and handle errors.
 * @param {Function} routeHandler - Function that is wrapped with the error handling.
 * @returns {Function} Middleware function with error handling.
 */
const errorHandler = (routeHandler) => (req, res, next) =>
  Promise.resolve(routeHandler(req, res, next)).catch(next);

module.exports = errorHandler;
