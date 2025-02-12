const express = require('express');
const router = express.Router();
const updateAppController = require('../Controller/updateAppController.jsx');
const authMiddleware = require('../middleware/authMiddleware.js'); // Import the middleware

// Protect this route with authMiddleware
router.put('/:appAcronym', authMiddleware, updateAppController);

module.exports = router;
