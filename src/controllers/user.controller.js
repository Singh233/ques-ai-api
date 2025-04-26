const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync.js');
const { userService } = require('../services/index.js');

const changeType = catchAsync(async (req, res) => {
  const { id, type } = req.body;
  await userService.changeUserType(id, type);
  return res.status(httpStatus.OK).json({ message: 'Type changed successfully' });
});

module.exports = { changeType };
