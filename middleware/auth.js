const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  if(false)
      next();
  else {
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};