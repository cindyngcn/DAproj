const express = require('express');
const router = express.Router();
const updateUser = require('../Controller/updateUserController.jsx');
const authMiddleware = require('../middleware/authMiddleware'); 
const { adminMiddleware, checkGroup } = require('../middleware/permission');

router.put('/update',authMiddleware, adminMiddleware, updateUser); // ✅ Pass the function as a handler

module.exports = router;
