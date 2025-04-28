const Joi = require('joi');
const { objectId } = require('./custom.validation.js');

const getFiles = {
  params: Joi.object().keys({
    projectId: Joi.string().custom(objectId).required(),
  }),
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    populate: Joi.string(),
  }),
};

const getFile = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
};

const createFile = {
  body: Joi.object().keys({
    project: Joi.string().custom(objectId).required(),
    name: Joi.string().required(),
    transcript: Joi.string(),
  }),
};

const updateFile = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    transcript: Joi.string().required(),
  }),
};

const deleteFile = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  getFiles,
  getFile,
  createFile,
  updateFile,
  deleteFile,
};
