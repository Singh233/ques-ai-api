const mongoose = require('mongoose');
const validator = require('validator');
const { softDelete, toJSON } = require('./plugins/index.js');

const emailSchema = mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: {
        type: String,
        private: true,
      },
      expires: {
        type: Date,
        private: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

emailSchema.plugin(softDelete);
emailSchema.plugin(toJSON);

const Email = mongoose.model('Email', emailSchema);

module.exports = Email;
