const express = require('express');
const router = express.Router();
const createTaskController = require('../Controller/createTaskController.jsx');
const authMiddleware = require('../middleware/authMiddleware.js');

// Protect this route with authMiddleware
router.post('/', authMiddleware, createTaskController);

module.exports = router;
