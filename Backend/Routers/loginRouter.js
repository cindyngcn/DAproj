const express = require('express');
const router = express.Router();
const loginController = require('../Controller/loginController.jsx');
const logoutController = require('../Controller/logoutController.jsx');

router.post('/login', loginController);

router.post('/logout', logoutController);
module.exports = router;