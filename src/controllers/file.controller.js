const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync.js');
const pick = require('../utils/pick.js');
const { fileService, projectService } = require('../services/index.js');

const createFile = catchAsync(async (req, res) => {
  const file = await fileService.createFile(req.body);

  // Update project metadata to reflect new file
  const project = await projectService.getProject(req.body.project);
  project.metaData.fileCount = (project.metaData.fileCount || 0) + 1;
  project.metaData.lastEdited = new Date();
  await project.save();

  res.status(httpStatus.CREATED).json({ message: 'File created successfully', file });
});

const getFiles = catchAsync(async (req, res) => {
  const filter = { project: req.params.projectId };
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
  const result = await fileService.queryFiles(filter, options);
  res.status(httpStatus.OK).json(result);
});

const getFile = catchAsync(async (req, res) => {
  const file = await fileService.getFile(req.params.id);
  res.status(httpStatus.OK).json({ message: 'File retrieved successfully', file });
});

const updateFile = catchAsync(async (req, res) => {
  const file = await fileService.updateFile(req.params.id, req.body);

  // Update project metadata to reflect file edit
  const project = await projectService.getProject(file.project);
  project.metaData.lastEdited = new Date();
  await project.save();

  res.status(httpStatus.OK).json({ message: 'File updated successfully', file });
});

const deleteFile = catchAsync(async (req, res) => {
  const file = await fileService.deleteFile(req.params.id);

  // Update project metadata to reflect file deletion
  const project = await projectService.getProject(file.project);
  project.metaData.fileCount = Math.max(0, (project.metaData.fileCount || 1) - 1);
  project.metaData.lastEdited = new Date();
  await project.save();

  res.status(httpStatus.OK).json({ message: 'File deleted successfully', file });
});

module.exports = { createFile, getFiles, getFile, updateFile, deleteFile };
