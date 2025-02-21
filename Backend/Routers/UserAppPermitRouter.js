const express = require('express');
const router = express.Router();
const updateUser = require('../Controller/updateUserController.jsx');
const userAppPermitController = require("../Controller/UserAppPermit.js");

router.post("/", userAppPermitController);

module.exports = router;
