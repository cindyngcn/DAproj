const express = require('express');
const router = express.Router();
const createUserController = require('../Controller/createUserController.jsx');
const authMiddleware = require('../middleware/authMiddleware'); // Import the middleware
const { adminMiddleware, checkGroup} = require('../middleware/permission');

// Protect this route with authMiddleware
router.post('/', authMiddleware, adminMiddleware, createUserController);

module.exports = router;
