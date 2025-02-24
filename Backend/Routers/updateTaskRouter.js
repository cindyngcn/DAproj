const express = require("express");
const updateTaskController = require("../Controller/updateTaskController.jsx");
const authMiddleware = require("../middleware/authMiddleware.js");

const router = express.Router();

router.put("/", authMiddleware, updateTaskController);

module.exports = router;