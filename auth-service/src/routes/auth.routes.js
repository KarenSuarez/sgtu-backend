const express = require('express');
const { login, register } = require('../controllers/auth.controller');
const { body, validationResult } = require('express-validator');

const router = express.Router();

router.post(
  '/login',
  [ body('email').isEmail(), body('password').isLength({ min: 6 }) ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  login
);

router.post(
  '/register',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('nombre').notEmpty().withMessage('El nombre es obligatorio')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  register
);

module.exports = router;

