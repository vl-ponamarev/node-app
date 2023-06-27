const ApiError = require('../exeptions/api-error');
const tokenService = require('../service/tokenService');

module.exports = function (req, res, next) {
  try {
    const autorizationHeader = req.headers.authorization;
    if (!autorizationHeader) {
      return next(ApiError.UnoutorizedError());
    }
    const accessToken = autorizationHeader.split(' ')[1];
    if (!accessToken) {
      return next(ApiError.UnoutorizedError());
    }

    const userData = tokenService.validateAccessToken(accessToken);
    if (!userData) {
      return next(ApiError.UnoutorizedError());
    }
    req.user = userData;
    next();
  } catch (err) {
    return next(ApiError.UnoutorizedError());
  }
};
