const express = require('express');
const User = require('../models/user.model.js');
const generateCrud = require('../utils/generateCrud.js');
const validate = require('../middlewares/validate.js');
const { cache } = require('../middlewares/redis.js');
const { userController } = require('../controllers/index.js');
const { userValidation } = require('../validations/index.js');
const auth = require('../middlewares/auth.js');

const router = express.Router();

const { getAll, update, search, softDelete, permanentDelete } = generateCrud(User, {
  name: 'User',
  searchableFields: 'name',
  populate: 'email',
  functions: ['getAll', 'getOne', 'create', 'update', 'search', 'softDelete', 'permanentDelete'],
});

router.get('/', cache('user'), validate(userValidation.getUsers), getAll);
router.get('/search/:searchQuery', cache('user'), validate(userValidation.searchUsers), search);

router.put('/change-role', cache('user'), validate(userValidation.changeType), userController.changeType);
router.put('/:id', cache('user'), validate(userValidation.updateUser), update);
router.delete('/:id', cache('user'), validate(userValidation.deleteUser), softDelete);
router.delete('/remove/:id', cache('user'), validate(userValidation.deleteUser), permanentDelete);

// Sign up route
router.post('/sign-up', validate(userValidation.signUpUser), userController.signUpUser);
// Sign in route
router.post('/sign-in', validate(userValidation.signInUser), userController.signInUser);
// Get me route
router.get('/me', auth(), userController.getMe);

module.exports = router;
