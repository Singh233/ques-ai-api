const crypto = require('crypto');
const { User, Token } = require('../models/index.js');
const tokenService = require('./token.service.js'); // Direct import to avoid circular dependency
const { tokenTypes } = require('../config/tokens.js');

const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const refreshAuth = async (refreshToken) => {
  const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
  const user = await User.findById(refreshTokenDoc.user);
  if (!user) {
    throw new Error('User not found');
  }

  await Token.findByIdAndDelete(refreshTokenDoc.id);
  return tokenService.generateAuthTokens(user);
};

/**
 * Logout user by removing refresh token
 * @param {string} refreshToken
 * @returns {Promise<boolean>}
 */
const logout = async (refreshToken) => {
  if (!refreshToken) {
    return false;
  }
  return tokenService.deleteRefreshToken(refreshToken);
};

module.exports = {
  generateToken,
  refreshAuth,
  logout,
};
