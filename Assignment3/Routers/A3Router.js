const express = require('express');
const router = express.Router();

const {createTask, getTaskbyState, promoteTask2Done} = require('../Controllers/A3Controller');

router.post("/CreateTask", createTask);
router.post("/GetTaskbyState", getTaskbyState);
router.patch("/PromoteTask2Done", promoteTask2Done);
router.get("/*", (req, res) => {
    res.status(404).send("Invalid URL");
});


module.exports = router;