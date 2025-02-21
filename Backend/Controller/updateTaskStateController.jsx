const mysql = require("mysql2");
const dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database!");
});

/*const updateTaskStateController = (req, res) => {
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ status: "error", message: "No token provided. Access denied." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ status: "error", message: "Invalid or expired token." });
    }

    const { Task_id, Task_state } = req.body;
    const Task_owner = decoded.username;

    if (!Task_id || !Task_state) {
      return res.status(400).json({ status: "error", message: "Task ID and Task state are required." });
    }

    const validStates = ["OPEN", "TODO", "DOING", "DONE", "CLOSED"];
    if (!validStates.includes(Task_state)) {
      return res.status(400).json({ status: "error", message: "Invalid task state." });
    }

    const updateTaskStateQuery = "UPDATE task SET Task_state = ?, Task_owner = ? WHERE Task_id = ?";
    connection.query(updateTaskStateQuery, [Task_state, Task_owner, Task_id], (err, result) => {
      if (err) {
        console.error("Error updating task state:", err);
        return res.status(500).json({ status: "error", message: "Internal server error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ status: "error", message: "Task not found." });
      }

      res.status(200).json({ status: "success", message: "Task state updated successfully." });
    });
  });
};*/

const updateTaskStateController = (req, res) => {
    const token = req.cookies.authToken;
    if (!token) {
      return res.status(401).json({ status: "error", message: "No token provided. Access denied." });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ status: "error", message: "Invalid or expired token." });
      }
  
      const { Task_id, Task_state, currentState } = req.body;
      const Task_owner = decoded.username;
  
      if (!Task_id || !Task_state || !currentState) {
        return res.status(400).json({ status: "error", message: "Task ID, Task state, and current state are required." });
      }
  
      // Check if Task_state is different from the current state in the database
      const validStates = ["OPEN", "TODO", "DOING", "DONE", "CLOSED"];
      if (!validStates.includes(Task_state)) {
        return res.status(400).json({ status: "error", message: "Invalid task state." });
      }
  
      // Retrieve the current Task_state from the database
      const getTaskQuery = "SELECT Task_state FROM task WHERE Task_id = ?";
      connection.query(getTaskQuery, [Task_id], (err, result) => {
        if (err) {
          console.error("Error fetching task state:", err);
          return res.status(500).json({ status: "error", message: "Internal server error" });
        }
  
        if (result.length === 0) {
          return res.status(404).json({ status: "error", message: "Task not found." });
        }
  
        const currentTaskState = result[0].Task_state;
  
        // Ensure the task's current state matches the state provided
        if (currentState !== currentTaskState) {
          return res.status(400).json({ status: "error", message: `Task state mismatch. Current state is ${currentTaskState}.` });
        }
  
        // Proceed to update the Task state if valid
        const updateTaskStateQuery = "UPDATE task SET Task_state = ?, Task_owner = ? WHERE Task_id = ?";
        connection.query(updateTaskStateQuery, [Task_state, Task_owner, Task_id], (err, result) => {
          if (err) {
            console.error("Error updating task state:", err);
            return res.status(500).json({ status: "error", message: "Internal server error" });
          }
  
          if (result.affectedRows === 0) {
            return res.status(404).json({ status: "error", message: "Task not found." });
          }
  
          res.status(200).json({ status: "success", message: "Task state updated successfully." });
        });
      });
    });
  };

module.exports = updateTaskStateController;
