const mongoose = require('mongoose');
const { toJSON, paginate, softDelete } = require('./plugins/index.js');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Email',
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    type: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
  },
  { timestamps: true },
);

userSchema.plugin(toJSON);
userSchema.plugin(paginate);
userSchema.plugin(softDelete);

const User = mongoose.model('User', userSchema);

module.exports = User;
