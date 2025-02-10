const express = require('express');
const router = express.Router();
const groupController = require('../Controller/groupController.jsx');

router.get('/', groupController.getGroups); // Get all groups (Authenticated users)
router.post('/', groupController.createGroup); // Create a group (Admin only)

module.exports = router;