const express = require('express');
const validate = require('../middlewares/validate.js');
const { projectValidation } = require('../validations/index.js');
const { projectController } = require('../controllers/index.js');
const { cache, deleteCacheByKey } = require('../middlewares/redis.js');
const auth = require('../middlewares/auth.js');

const router = express.Router();

// Create a new project
router.post(
  '/create',
  auth(),
  validate(projectValidation.createProject),
  deleteCacheByKey('project'),
  projectController.createProject,
);

// Get all projects
router.get('/', auth(), validate(projectValidation.getProjects), cache('project'), projectController.getProjects);

// Get project by id
router.get('/:id', auth(), validate(projectValidation.getProject), cache('project'), projectController.getProject);

// Get project by name
router.get(
  '/by-name/:name',
  auth(),
  validate(projectValidation.getProjectByName),
  cache('project'),
  projectController.getProjectByName,
);

module.exports = router;
