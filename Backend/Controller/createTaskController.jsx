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

const createTaskController = (req, res) => {
    const token = req.cookies.authToken;
    if (!token) {
      return res.status(401).json({ status: "error", message: "No token provided. Access denied." });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ status: "error", message: "Invalid or expired token." });
      }
  
      const { Task_name, Task_description, Task_notes, Task_plan, Task_app_Acronym } = req.body;
      const Task_creator = decoded.username;
      const Task_state = "OPEN";
      const Task_createDate = new Date().toISOString().slice(0, 19).replace("T", " ");
      const Task_owner = Task_creator;
  
      // Fetch App_RNumber from the application table
      const getAppQuery = "SELECT App_RNumber FROM application WHERE App_Acronym = ?";
      connection.query(getAppQuery, [Task_app_Acronym], (err, appResults) => {
        if (err) {
          console.error("Error querying application table:", err);
          return res.status(500).json({ status: "error", message: "Internal server error" });
        }
  
        if (appResults.length === 0) {
          return res.status(400).json({ status: "error", message: "Application acronym does not exist." });
        }
  
        const App_RNumber = appResults[0].App_RNumber;
        const Task_id = `${Task_app_Acronym}_${App_RNumber}`;
  
        // Insert the task into the database
        const insertTaskQuery = "INSERT INTO task (Task_id, Task_name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        connection.query(insertTaskQuery, [Task_id, Task_name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate], (err) => {
          if (err) {
            console.error("Error inserting task into database:", err);
            return res.status(500).json({ status: "error", message: "Internal server error" });
          }
  
          res.status(201).json({
            status: "success",
            message: "Task created successfully.",
          });
        });
      });
    });
  };
  
  module.exports = createTaskController;
