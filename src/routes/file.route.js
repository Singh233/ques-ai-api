const express = require('express');
const validate = require('../middlewares/validate.js');
const { fileValidation } = require('../validations/index.js');
const { fileController } = require('../controllers/index.js');
const { cache, deleteCacheByKey } = require('../middlewares/redis.js');
const auth = require('../middlewares/auth.js');

const router = express.Router();

// Get all files related to a project
router.get('/project/:projectId', auth(), validate(fileValidation.getFiles), cache('file'), fileController.getFiles);

// Get a specific file by ID
router.get('/:id', auth(), validate(fileValidation.getFile), cache('file'), fileController.getFile);

// Create a new file
router.post(
  '/create',
  auth(),
  validate(fileValidation.createFile),
  deleteCacheByKey('project'),
  deleteCacheByKey('file'),
  fileController.createFile,
);

// Update a file (only transcript can be updated)
router.put(
  '/:id',
  auth(),
  validate(fileValidation.updateFile),
  deleteCacheByKey('project'),
  deleteCacheByKey('file'),
  fileController.updateFile,
);

// Delete a file
router.delete(
  '/:id',
  auth(),
  validate(fileValidation.deleteFile),
  deleteCacheByKey('project'),
  deleteCacheByKey('file'),
  fileController.deleteFile,
);

module.exports = router;
