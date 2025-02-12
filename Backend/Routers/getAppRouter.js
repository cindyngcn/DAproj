const express = require('express');
const router = express.Router();
const getAppController = require('../Controller/getAppController.jsx');
const authMiddleware = require('../middleware/authMiddleware.js'); 

// Get all applications
router.get('/', authMiddleware, getAppController);

// Get a specific application by acronym
router.get('/:appAcronym', authMiddleware, getAppController);

module.exports = router;
