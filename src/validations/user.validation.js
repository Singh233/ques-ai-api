const Joi = require('joi');
const { objectId, password } = require('./custom.validation.js');
const { Types } = require('../config/accessControl.js');

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    populate: Joi.string(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
};

const searchUsers = {
  params: Joi.object().keys({
    searchQuery: Joi.string().required(),
  }),
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    populate: Joi.string(),
    types: Joi.array().items(Joi.string().valid(...Object.values(Types))),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    id: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      type: Joi.string().valid(...Object.values(Types)),
    })
    .min(1),
};

const changeType = {
  body: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
    type: Joi.string()
      .valid(...Object.values(Types))
      .required(),
  }),
};

const deleteUser = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
};

const signUpUser = {
  body: Joi.object()
    .keys({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().custom(password).required(),
      type: Joi.string().valid(...Object.values(Types)),
    })
    .min(1),
};

const signInUser = {
  body: Joi.object()
    .keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    })
    .min(1),
};

module.exports = {
  getUsers,
  getUser,
  searchUsers,
  updateUser,
  changeType,
  deleteUser,
  signUpUser,
  signInUser,
};
