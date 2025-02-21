const express = require('express');
const router = express.Router();
const createAppController = require('../Controller/createAppController.jsx');
const authMiddleware = require('../middleware/authMiddleware.js'); // Import auth middleware
const { plMiddleware } = require('../middleware/permission.js'); // Import PL group middleware

// Protect this route with authMiddleware and plMiddleware
router.post('/', authMiddleware, plMiddleware, createAppController);

module.exports = router;

