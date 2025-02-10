const express = require('express');
const router = express.Router();
const updateProfileController = require('../Controller/updateProfileController.jsx');
const authMiddleware = require('../middleware/authMiddleware'); // Import the middleware

// Protect this route with authMiddleware
router.put('/', authMiddleware, updateProfileController);

module.exports = router;
