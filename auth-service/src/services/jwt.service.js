const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN;

exports.generateToken = (payload) =>
  jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });

exports.verifyToken = (token) =>
  jwt.verify(token, SECRET);
