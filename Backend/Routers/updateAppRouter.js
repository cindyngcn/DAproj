const express = require('express');
const router = express.Router();
const updateAppController = require('../Controller/updateAppController.jsx');
const authMiddleware = require('../middleware/authMiddleware.js'); // Import the middleware
const { plMiddleware } = require('../middleware/permission.js');

// Protect this route with authMiddleware
//router.put('/', authMiddleware, updateAppController);
router.put('/:appAcronym', authMiddleware, plMiddleware, updateAppController);

module.exports = router;
