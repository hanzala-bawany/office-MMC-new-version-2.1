const winston = require("winston");  

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error"
    })
  ]
});

module.exports = {
    logger
}