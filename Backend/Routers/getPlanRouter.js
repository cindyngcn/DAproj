const express = require("express");
const router = express.Router();
const getPlanDetailsController = require("../Controller/getPlanController.jsx");
const authMiddleware = require('../middleware/authMiddleware.js'); 

router.get("/:appAcronym", authMiddleware, getPlanDetailsController);

module.exports = router;