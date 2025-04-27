const httpStatus = require('http-status');
const express = require('express');
const router = express.Router();

const userRoute = require('./user.route.js');
const authRoute = require('./auth.route.js');
const projectRoute = require('./project.route.js');

router.get('/health', (req, res) => {
  res.status(httpStatus.OK).json({ status: 'OK' });
});

router.use('/user', userRoute);
router.use('/auth', authRoute);
router.use('/project', projectRoute);

module.exports = router;
