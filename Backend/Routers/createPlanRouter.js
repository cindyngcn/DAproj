const express = require('express');
const router = express.Router();
const createPlanController = require('../Controller/createPlanController.jsx');
const authMiddleware = require('../middleware/authMiddleware.js');
const { pmMiddleware } = require('../middleware/permission.js');

// Protect this route with authMiddleware
router.post('/:appAcronym', authMiddleware, pmMiddleware, createPlanController);

module.exports = router;
