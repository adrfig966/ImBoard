module.exports.grabIP = function(req, res, next) {
  req.parsedIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  next();
}
