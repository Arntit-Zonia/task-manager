/**
 * Catches errors originating from other middleware functions
 *
 * @param {Error} err - error obj
 * @param {Object} _req - req obj (not used)
 * @param {Object} res - sends the error response
 * @param {Function} _next - next middleware function in the stack (not used)
 */
const middlewareErrorHandler = (err, _req, res, _next) => {
  // Log the error object to the console
  console.error({ err });

  // Send an HTTP response with the error status (or 500 if not specified) and the error message
  res.status(err.status || 500).send({ error: err.message });
};

module.exports = middlewareErrorHandler;
