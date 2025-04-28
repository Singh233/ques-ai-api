const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError.js');
const { File } = require('../models/index.js');

/**
 * Create a file
 * @param {Object} fileBody
 * @returns {Promise<File>}
 */
const createFile = async (fileBody) => {
  return File.create({ ...fileBody });
};

/**
 * Query for files
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryFiles = async (filter, options) => {
  const files = await File.paginate(filter, options);
  return files;
};

/**
 * Get file by id
 * @param {ObjectId} id
 * @returns {Promise<File>}
 */
const getFileById = async (id) => {
  return File.findById(id);
};

/**
 * Get file by id
 * @param {ObjectId} id
 * @returns {Promise<File>}
 */
const getFile = async (id) => {
  const file = await getFileById(id);
  if (!file) {
    throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  }
  return file;
};

/**
 * Update file transcript by id
 * @param {ObjectId} fileId
 * @param {Object} updateBody
 * @returns {Promise<File>}
 */
const updateFile = async (fileId, updateBody) => {
  const file = await getFile(fileId);
  Object.assign(file, updateBody);
  await file.save();
  return file;
};

/**
 * Delete file by id
 * @param {ObjectId} fileId
 * @returns {Promise<File>}
 */
const deleteFile = async (fileId) => {
  const file = await getFile(fileId);
  if (!file) {
    throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  }
  await file.softDelete();
  return file;
};

module.exports = {
  createFile,
  queryFiles,
  getFileById,
  getFile,
  updateFile,
  deleteFile,
};
