const { logger } = require("./errorLogsMaker.js");

const handleError = (res, err, message = "Internal server error", status = 500) => {

  console.log(message, err);

  logger.error(message, {
    message: err.message,
    stack: err.stack,   // kis file m ekia err or kab
    error: err,
  });

  return res.status(status).json({
    success: false,
    message: err.message || message,
  });

};

module.exports = {
    handleError
}