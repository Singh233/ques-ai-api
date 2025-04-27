const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync.js');
const pick = require('../utils/pick.js');
const { projectService } = require('../services/index.js');

const createProject = catchAsync(async (req, res) => {
  const project = await projectService.createProject(req.body);
  res.status(httpStatus.CREATED).json({ message: 'Project created successfully', project });
});

const getProjects = catchAsync(async (req, res) => {
  const filter = { ...pick(req.query, ['name']), user: req.user.id };
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
  const result = await projectService.queryProjects(filter, options);
  res.status(httpStatus.OK).json(result);
});

const getProject = catchAsync(async (req, res) => {
  const project = await projectService.getProject(req.params.id);
  res.status(httpStatus.OK).json({ message: 'Project retrieved successfully', project });
});

module.exports = { createProject, getProjects, getProject };
