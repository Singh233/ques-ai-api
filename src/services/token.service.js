const jwt = require('jsonwebtoken');
const moment = require('moment');
const config = require('../config/config.js');
const { Token } = require('../models/index.js');
const { tokenTypes } = require('../config/tokens.js');

const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

const saveToken = async (token, userId, expires, type) => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    expires: expires.toDate(),
    type,
  });
  return tokenDoc;
};

const verifyToken = async (token, type) => {
  console.log('Verifying token:', token, type);
  const payload = jwt.verify(token, config.jwt.secret);
  console.log(payload.sub)
  const tokenDoc = await Token.findOne({ token, type, user: payload.sub });
  if (!tokenDoc) {
    throw new Error('Token not found or expired');
  }
  return tokenDoc;
};

const generateAuthTokens = async (user) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS);

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);
  await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Delete a refresh token for a user during logout
 * @param {string} refreshToken - The refresh token to delete
 * @returns {Promise<boolean>} - True if successful
 */
const deleteRefreshToken = async (refreshToken) => {
  const result = await Token.findOneAndDelete({ token: refreshToken, type: tokenTypes.REFRESH });
  return !!result;
};

module.exports = { generateToken, saveToken, verifyToken, generateAuthTokens, deleteRefreshToken };
