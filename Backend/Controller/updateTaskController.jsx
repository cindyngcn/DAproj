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

/*const updateTaskController = (req, res) => {
    const token = req.cookies.authToken;
    if (!token) {
      return res.status(401).json({ status: "error", message: "No token provided. Access denied." });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err) => {
      if (err) {
        return res.status(403).json({ status: "error", message: "Invalid or expired token." });
      }
  
      const { Task_id, Task_plan, Task_notes } = req.body;
  
      if (!Task_id) {
        return res.status(400).json({ status: "error", message: "Task ID is required." });
      }
  
      // Check if Task_plan needs updating
      if (Task_plan) {
        const getPlanColorQuery = "SELECT Plan_color FROM plan WHERE Plan_MVP_name = ? AND Plan_app_Acronym = ?";
        connection.query(getPlanColorQuery, [Task_plan, req.body.Task_app_Acronym], (err, planResults) => {
          if (err) {
            console.error("Error fetching plan color:", err);
            return res.status(500).json({ status: "error", message: "Internal server error" });
          }
  
          let Plan_color = planResults.length > 0 ? planResults[0].Plan_color : "#6e7f7e";
  
          // Now update task without Plan_color
          updateTask(Task_id, Task_plan, Task_notes, res);
        });
      } else {
        updateTask(Task_id, Task_plan, Task_notes, res);
      }
    });
  };

  const updateTask = (Task_id, Task_plan, Task_notes, res) => {
    let updateFields = [];
    let queryParams = [];
  
    if (Task_plan) {
      updateFields.push("Task_plan = ?");
      queryParams.push(Task_plan);
    }
  
    if (Task_notes) {
      updateFields.push("Task_notes = ?");
      queryParams.push(Task_notes);
    }
  
    if (updateFields.length === 0) {
      return res.status(400).json({ status: "error", message: "No valid fields to update." });
    }
  
    queryParams.push(Task_id);
    const updateTaskQuery = `UPDATE task SET ${updateFields.join(", ")} WHERE Task_id = ?`;
  
    connection.query(updateTaskQuery, queryParams, (err, result) => {
      if (err) {
        console.error("Error updating task:", err);
        return res.status(500).json({ status: "error", message: "Internal server error" });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ status: "error", message: "Task not found." });
      }
  
      res.status(200).json({ status: "success", message: "Task updated successfully." });
    });
  };*/

  const updateTaskController = (req, res) => {
    const token = req.cookies.authToken;
    if (!token) {
      return res.status(401).json({ status: "error", message: "No token provided. Access denied." });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err) => {
      if (err) {
        return res.status(403).json({ status: "error", message: "Invalid or expired token." });
      }
  
      const { Task_id, Task_plan, Task_notes, Task_app_Acronym } = req.body;
  
      // Log the request body to ensure Task_app_Acronym is included
      console.log("Received Request Body:", req.body);
  
      if (!Task_id) {
        return res.status(400).json({ status: "error", message: "Task ID is required." });
      }
  
      // Check if Task_app_Acronym is undefined
      if (!Task_app_Acronym) {
        return res.status(400).json({ status: "error", message: "Task_app_Acronym is missing." });
      }
  
      // Check if Task_plan needs updating
      if (Task_plan) {
        const getPlanColorQuery = "SELECT Plan_color FROM plan WHERE Plan_MVP_name = ? AND Plan_app_Acronym = ?";
  
        // Log the inputs before running the query
        console.log(`Running query to fetch Plan_color for Task_plan '${Task_plan}' and Task_app_Acronym '${Task_app_Acronym}'`);
  
        connection.query(getPlanColorQuery, [Task_plan, Task_app_Acronym], (err, planResults) => {
          if (err) {
            console.error("Error fetching plan color:", err);
            return res.status(500).json({ status: "error", message: "Internal server error" });
          }
  
          // Log the query result
          console.log("Query result:", planResults);
  
          // If no color is found, use the fallback color
          let Plan_color = planResults.length > 0 ? planResults[0].Plan_color : "#6e7f7e";
  
          // Log the determined Plan_color
          console.log(`Plan_color for Task_plan '${Task_plan}' fetched from DB is: ${Plan_color}`);
  
          // Now update task with the fetched Plan_color
          updateTask(Task_id, Task_plan, Task_notes, Plan_color, res);
        });
      } else {
        updateTask(Task_id, Task_plan, Task_notes, null, res);
      }
    });
  };  
  
  const updateTask = (Task_id, Task_plan, Task_notes, Plan_color, res) => {
    let updateFields = [];
    let queryParams = [];
  
    if (Task_plan) {
      updateFields.push("Task_plan = ?");
      queryParams.push(Task_plan);
    }
  
    if (Task_notes) {
      updateFields.push("Task_notes = ?");
      queryParams.push(Task_notes);
    }
  
    // If Plan_color is provided, you can log it and update accordingly (if necessary)
    if (Plan_color) {
      console.log(`Updating Task ID: ${Task_id} with Plan_color: ${Plan_color}`);
    }
  
    if (updateFields.length === 0) {
      return res.status(400).json({ status: "error", message: "No valid fields to update." });
    }
  
    queryParams.push(Task_id);
    const updateTaskQuery = `UPDATE task SET ${updateFields.join(", ")} WHERE Task_id = ?`;
  
    connection.query(updateTaskQuery, queryParams, (err, result) => {
      if (err) {
        console.error("Error updating task:", err);
        return res.status(500).json({ status: "error", message: "Internal server error" });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ status: "error", message: "Task not found." });
      }
  
      res.status(200).json({ status: "success", message: "Task updated successfully." });
    });
  };
  
module.exports = updateTaskController;
