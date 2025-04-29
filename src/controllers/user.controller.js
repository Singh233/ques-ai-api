const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync.js');
const { userService } = require('../services/index.js');
const { generateAuthTokens } = require('../services/token.service.js');
const config = require('../config/config.js');

const changeType = catchAsync(async (req, res) => {
  const { id, type } = req.body;
  await userService.changeUserType(id, type);
  return res.status(httpStatus.OK).json({ message: 'Type changed successfully' });
});

const signUpUser = catchAsync(async (req, res) => {
  const userData = req.body;
  const user = await userService.signUpUser(userData);
  const tokens = await generateAuthTokens(user);
  res.cookie('accessToken', tokens.access.token, {
    secure: config.env === 'production' && req.secure,
    sameSite: 'strict',
    maxAge: config.jwt.accessExpirationMinutes * 60 * 1000,
  });

  res.cookie('refreshToken', tokens.refresh.token, {
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: config.jwt.refreshExpirationDays * 24 * 60 * 60 * 1000,
  });
  return res.status(httpStatus.CREATED).json({ message: 'User created successfully', user, tokens });
});

const signInUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.signInUser(email, password);
  const tokens = await generateAuthTokens(user);
  res.cookie('accessToken', tokens.access.token, {
    secure: config.env === 'production' && req.secure,
    sameSite: 'strict',
    maxAge: config.jwt.accessExpirationMinutes * 60 * 1000,
  });

  res.cookie('refreshToken', tokens.refresh.token, {
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: config.jwt.refreshExpirationDays * 24 * 60 * 60 * 1000,
  });
  return res.status(httpStatus.OK).json({ message: 'User signed in successfully', user, tokens });
});

const getMe = catchAsync(async (req, res) => {
  const user = await userService.getMe(req.user);
  return res.status(httpStatus.OK).json({ message: 'User retrieved successfully', user });
});

module.exports = { changeType, signUpUser, signInUser, getMe };
