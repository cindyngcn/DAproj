const express = require('express');
const router = express.Router();
const createUserController = require('../Controller/createUserController.jsx');
const authMiddleware = require('../middleware/authMiddleware'); // Import the middleware

// Protect this route with authMiddleware
router.post('/', authMiddleware, createUserController);

module.exports = router;
