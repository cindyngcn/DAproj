const express = require("express");
const router = express.Router();
const getTaskDetailsController = require("../Controller/getTaskController.jsx");
const authMiddleware = require('../middleware/authMiddleware.js'); // If you still need the middleware

router.get("/:appAcronym", authMiddleware, getTaskDetailsController);

module.exports = router;
