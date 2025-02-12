const express = require('express');
const router = express.Router();
const groupController = require('../Controller/groupController.jsx');
const authMiddleware = require('../middleware/authMiddleware'); 
const { adminMiddleware, checkGroup } = require('../middleware/permission');

router.get('/', authMiddleware, groupController.getGroups); // Get all groups (Authenticated users)
router.post('/', authMiddleware, adminMiddleware, groupController.createGroup); // Create a group (Admin only)

module.exports = router;