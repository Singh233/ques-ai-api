const { User } = require('../models/index.js');

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

module.exports = {
  checkUserType,
};
