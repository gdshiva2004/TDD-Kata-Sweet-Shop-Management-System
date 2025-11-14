const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/auth.controller');
router.post('/register',
  body('name').isLength({ min: 2 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  authController.register
);
router.post('/login',
  body('email').isEmail(),
  body('password').exists(),
  authController.login
);
module.exports = router;
