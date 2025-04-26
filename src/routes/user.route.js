const express = require('express');
const User = require('../models/user.model.js');
const generateCrud = require('../utils/generateCrud.js');
const validate = require('../middlewares/validate.js');
const { cache } = require('../middlewares/redis.js');
const { userController } = require('../controllers/index.js');
const { userValidation } = require('../validations/index.js');

const router = express.Router();

const { getAll, getOne, update, search, softDelete, permanentDelete } = generateCrud(User, {
  name: 'User',
  searchableFields: 'name',
  populate: 'email',
  functions: ['getAll', 'getOne', 'create', 'update', 'search', 'softDelete', 'permanentDelete'],
});

router.get('/', cache('user'), validate(userValidation.getUsers), getAll);
router.get('/:id', cache('user'), validate(userValidation.getUser), getOne);
router.get('/search/:searchQuery', cache('user'), validate(userValidation.searchUsers), search);

router.put('/change-role', cache('user'), validate(userValidation.changeType), userController.changeType);
router.put('/:id', cache('user'), validate(userValidation.updateUser), update);
router.delete('/:id', cache('user'), validate(userValidation.deleteUser), softDelete);
router.delete('/remove/:id', cache('user'), validate(userValidation.deleteUser), permanentDelete);

module.exports = router;
