const express = require('express');
const router = express.Router();

const {createTask, getTaskbyState, promoteTask2Done} = require('../Controllers/A3Controller');

router.post("/CreateTask", createTask);
router.post("/GetTaskbyState", getTaskbyState);
router.patch("/PromoteTask2Done", promoteTask2Done);
router.all("/*", (req, res) => {
    res.status(404).send("E1001");
});
module.exports = router;