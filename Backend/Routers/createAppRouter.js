const express = require('express');
const router = express.Router();
const createAppController = require('../Controller/createAppController.jsx');
const authMiddleware = require('../middleware/authMiddleware.js'); // Import the middleware

// Protect this route with authMiddleware
router.post('/', authMiddleware, createAppController);

module.exports = router;
