const Joi = require('joi');
const { objectId } = require('./custom.validation.js');

const getProjects = {
  query: Joi.object().keys({
    name: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    populate: Joi.string(),
  }),
};

const getProject = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
};

const getProjectByName = {
  params: Joi.object().keys({
    name: Joi.string().required(),
  }),
};

const createProject = {
  body: Joi.object().keys({
    user: Joi.string().custom(objectId).required(),
    name: Joi.string().required(),
    coverImage: Joi.string(),
  }),
};

module.exports = {
  getProjects,
  getProject,
  getProjectByName,
  createProject,
};
