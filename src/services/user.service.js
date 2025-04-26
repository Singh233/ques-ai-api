const { User, Email } = require('../models/index.js');
const ApiError = require('../utils/ApiError.js');
const bcrypt = require('bcryptjs');

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

const signUpUser = async (userData) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
  userData.password = hashedPassword;

  const emailDoc = await Email.findOne({ address: userData.email });

  if (emailDoc) {
    throw new ApiError(400, 'User already exists');
  }
  const email = new Email({ address: userData.email });
  const savedEmail = await email.save();

  userData.email = savedEmail._id;

  const user = new User(userData);
  const savedUser = await user.save();

  if (!savedUser) {
    throw new ApiError(500, 'Error saving user');
  }

  // Remove password from the saved user object before returning
  savedUser.password = undefined;

  return savedUser;
};

const signInUser = async (email, password) => {
  const emailDoc = await Email.findOne({ address: email });
  const user = await User.findOne({ email: emailDoc._id }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Remove password from the user object before returning
  user.password = undefined;

  return user;
};

const getMe = async (userId) => {
  const user = await User.findById(userId).populate('email', 'address');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  // Remove password from the user object before returning
  user.password = undefined;
  return user;
};

module.exports = {
  checkUserType,
  changeUserType,
  signUpUser,
  signInUser,
  getMe,
};
