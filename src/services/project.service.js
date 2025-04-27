const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError.js');
const Project = require('../models/project.model.js');

/**
 * Create a project
 * @param {Object} projectBody
 * @returns {Promise<Project>}
 */
const createProject = async (projectBody) => {
  const existingProject = await Project.findOne({ name: projectBody.name, user: projectBody.user });
  if (existingProject) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Project name must be unique!');
  }
  return Project.create({ ...projectBody });
};

/**
 * Query for projects
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryProjects = async (filter, options) => {
  const projects = await Project.paginate(filter, options);
  return projects;
};

/**
 * Get project by id
 * @param {ObjectId} id
 * @returns {Promise<Project>}
 */
const getProjectById = async (id) => {
  return Project.findById(id);
};

/**
 * Get project by id
 * @param {ObjectId} id
 * @returns {Promise<Project>}
 */
const getProject = async (id) => {
  const project = await getProjectById(id);
  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
  }
  return project;
};

module.exports = {
  createProject,
  queryProjects,
  getProject,
};
