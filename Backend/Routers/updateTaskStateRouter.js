const express = require("express");
const updateTaskStateController = require("../Controller/updateTaskStateController.jsx");
const authMiddleware = require("../middleware/authMiddleware.js");

const router = express.Router();

// Route to update task state
router.put("/", authMiddleware, updateTaskStateController);

module.exports = router;