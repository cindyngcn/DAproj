const express = require("express");
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Import the middleware
const {getGroupsController, createApplicationController, updateApplicationController } = require("../Controller/createAppController.jsx");

// Routes
router.get('/', authMiddleware, getGroupsController); 
router.post("/", authMiddleware, createApplicationController);
router.put("/", authMiddleware, updateApplicationController);

module.exports = router;
