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

module.exports = { checkAdmin, refreshTokens };
