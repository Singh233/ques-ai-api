const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync.js');
const ApiError = require('../utils/ApiError.js');
const { Types } = require('../config/accessControl.js');
const { authService, userService } = require('../services/index.js');

const checkAdmin = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const isAdmin = await userService.checkUserRole(email, Types.ADMIN);
  if (!isAdmin) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not authorized');
  }
  next();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.status(httpStatus.OK).json({ ...tokens });
});

/**
 * Logout user by invalidating refresh token
 */
const logout = catchAsync(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken || req.headers['x-refresh-token'];

  if (!refreshToken) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: 'Refresh token is required' });
  }

  await authService.logout(refreshToken);

  // Clear cookies if they exist
  if (req.cookies?.accessToken) {
    res.clearCookie('accessToken');
  }
  if (req.cookies?.refreshToken) {
    res.clearCookie('refreshToken');
  }

  return res.status(httpStatus.OK).json({ message: 'Logged out successfully' });
});

module.exports = { checkAdmin, refreshTokens, logout };
