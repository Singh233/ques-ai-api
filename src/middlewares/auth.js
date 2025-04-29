const passport = require('passport');
const httpStatus = require('http-status');
const moment = require('moment');
const { extractRefreshToken } = require('../utils/helper.js');
const ApiError = require('../utils/ApiError.js');
const jwt = require('jsonwebtoken');
const config = require('../config/config.js');
const { authService } = require('../services/index.js');
const logger = require('../config/logger.js');

const verifyCallback = (req, resolve, reject) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }

  req.user = user;

  resolve();
};

const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  const cookies = req.headers.cookie;
  if (cookies) {
    const cookieArray = cookies.split('; ');
    for (const cookie of cookieArray) {
      const [name, value] = cookie.split('=');
      if (name === 'accessToken') {
        return decodeURIComponent(value);
      }
    }
  }

  return null;
};

const isTokenExpiredOrCloseToExpiry = (token) => {
  try {
    const payload = jwt.decode(token);
    if (!payload || !payload.exp) return true;

    // Calculate time until expiration in seconds
    const timeUntilExpiry = payload.exp - Math.floor(Date.now() / 1000);

    // Return true if token is expired or will expire within 5 minutes (300 seconds)
    return timeUntilExpiry <= 300;
  } catch (error) {
    logger.error(`Error decoding token: ${error.message}`);
    return true;
  }
};

const auth = () => async (req, res, next) => {
  const accessToken = extractToken(req);

  if (!accessToken) {
    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject))(req, res, next);
    })
      .then(() => {
        next();
      })
      .catch((err) => {
        logger.error(`Passport authentication failed: ${err.message}`);
        next(err);
      });
  }

  req.headers.authorization = `Bearer ${accessToken}`;

  try {
    if (isTokenExpiredOrCloseToExpiry(accessToken)) {
      const refreshToken = extractRefreshToken(req);

      if (!refreshToken) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Access token expired and no refresh token available');
      }

      try {
        const tokens = await authService.refreshAuth(refreshToken);

        const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
        const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');

        res.set('Access-Token-Expires', accessTokenExpires.unix());
        res.set('Refresh-Token-Expires', refreshTokenExpires.unix());

        if (req.cookies?.refreshToken) {
          res.cookie('accessToken', tokens.access.token, {
            secure: config.env === 'production',
            sameSite: 'strict',
            maxAge: config.jwt.accessExpirationMinutes * 60 * 1000,
          });

          res.cookie('refreshToken', tokens.refresh.token, {
            secure: config.env === 'production',
            sameSite: 'strict',
            maxAge: config.jwt.refreshExpirationDays * 24 * 60 * 60 * 1000,
          });
        }

        // Add the newly refreshed token to the request for authentication
        req.headers.authorization = `Bearer ${tokens.access.token}`;
      } catch (refreshError) {
        logger.error(`Token refresh failed: ${JSON.stringify(refreshError)}`);
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Failed to refresh authentication token');
      }
    }

    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject))(req, res, next);
    })
      .then(() => {
        next();
      })
      .catch((err) => {
        logger.error(`Passport authentication failed: ${err.message}`);
        next(err);
      });
  } catch (error) {
    logger.error(`Authentication middleware encountered an error: ${error.message}`);
    return next(error);
  }
};

module.exports = auth;
