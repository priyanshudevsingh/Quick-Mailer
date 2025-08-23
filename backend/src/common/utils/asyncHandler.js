/**
 * Async Handler Utility
 * Wraps async functions to handle errors automatically
 */

module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
