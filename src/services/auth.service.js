const crypto = require('crypto');
const { User, Token } = require('../models/index.js');
const { tokenService } = require('../services/index.js');
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

module.exports = {
  generateToken,
  refreshAuth,
};
