const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

// Set up the MySQL connection
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

const getTaskDetailsController = (req, res) => {
  const token = req.cookies.authToken; // Get the token from cookies

  if (!token) {
    return res.status(401).json({ status: "error", message: "No token provided. Access denied." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ status: "error", message: "Invalid or expired token." });
    }

    const { appAcronym } = req.params; // Getting the appAcronym from URL parameters

    // Query to get task details
    const getTaskQuery = `
      SELECT Task_id, Task_name, Task_description, Task_notes, Task_state, Task_creator, Task_owner, Task_createDate
      FROM task
      WHERE Task_app_Acronym = ?`;
    
    connection.query(getTaskQuery, [appAcronym], (err, results) => {
      if (err) {
        console.error("Error fetching task details:", err);
        return res.status(500).json({ status: "error", message: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ status: "error", message: "No tasks found for this application" });
      }

      // Send back the task details
      res.status(200).json({
        status: "success",
        tasks: results, // Return all tasks with their details
      });
    });
  });
};

module.exports = getTaskDetailsController;
