const express = require('express');
const router = express.Router();
const createPlanController = require('../Controller/createPlanController.jsx');
const authMiddleware = require('../middleware/authMiddleware.js');

// Protect this route with authMiddleware
router.post('/:appAcronym', authMiddleware, createPlanController);

module.exports = router;
