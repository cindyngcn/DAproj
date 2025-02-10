const express = require('express');
const router = express.Router();
const updateUser = require('../Controller/updateUserController.jsx');

router.put('/update', updateUser); // ✅ Pass the function as a handler

module.exports = router;
