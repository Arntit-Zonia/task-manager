/**
 * Wraps route handler to catch and handle errors.
 * @param {Function} routeHandler - Function that is wrapped with the error handling.
 * @returns {Function} Middleware function with error handling.
 */
const errorHandler = (routeHandler) => async (req, res, next) => {
  try {
    await routeHandler(req, res, next);
  } catch (error) {
    next(error);
  }
};

module.exports = errorHandler;
