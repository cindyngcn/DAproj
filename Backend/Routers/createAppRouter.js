const express = require('express');
const router = express.Router();
const createAppController = require('../Controller/createAppController.jsx');
const authMiddleware = require('../middleware/authMiddleware.js'); // Import the middleware
//const { plMiddleware } = require('../middleware/permission.js'); // Import the PL group middleware

// Protect this route with authMiddleware
router.post('/', authMiddleware, createAppController);

module.exports = router;
