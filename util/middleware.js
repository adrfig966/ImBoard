const hash = require('object-hash');

module.exports.grabIP = function(req, res, next) {
  req.parsedIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  req.hashedIP = hash.MD5(req.parsedIP);
  next();
}
