const express = require('express');
const validate = require('../middlewares/validate.js');
const { authValidation } = require('../validations/index.js');
const { authController } = require('../controllers/index.js');

const router = express.Router();

router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);
router.post('/logout', authController.logout);

module.exports = router;
