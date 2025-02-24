const express = require('express');
const router = express.Router();
const notifyGroupOnTaskDone = require("../Controller/email.js");

router.post("/", notifyGroupOnTaskDone);

module.exports = router;
