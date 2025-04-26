const { User } = require('../models/index.js');
const ApiError = require('../utils/ApiError.js');

const checkUserType = async (email, type) => {
  const result = await User.aggregate([
    {
      $lookup: {
        from: 'emails',
        localField: 'email',
        foreignField: '_id',
        as: 'email',
      },
    },
    {
      $unwind: '$email',
    },
    {
      $match: {
        'email.address': email,
      },
    },
  ]);

  if (result.length === 0) {
    return false;
  }

  return result[0]?.type === type;
};

const changeUserType = async (userId, type) => {
  const [userDoc] = await Promise.all([User.findById(userId)]);

  if (!userDoc) {
    throw new ApiError(404, 'User not found');
  }

  userDoc.type = type;
  const savedUser = await userDoc.save();

  if (!savedUser) {
    throw new ApiError(500, 'Error saving user');
  }

  return savedUser;
};

module.exports = {
  checkUserType,
  changeUserType,
};
