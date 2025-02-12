const express = require('express');
const router = express.Router();
const getAppController = require('../Controller/getAppController.jsx');

// Get application by acronym
router.get('/', getAppController);

module.exports = router;
