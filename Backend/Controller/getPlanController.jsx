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

const getPlanDetailsController = (req, res) => {
    const token = req.cookies.authToken; // Get the token from cookies
  
    if (!token) {
      return res.status(401).json({ status: "error", message: "No token provided. Access denied." });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ status: "error", message: "Invalid or expired token." });
      }
  
      const { appAcronym } = req.params; // Getting the appAcronym from URL parameters
  
      // Query to get both Plan_MVP_name and Plan_color
      const getPlanQuery = "SELECT Plan_MVP_name, Plan_color FROM plan WHERE Plan_app_Acronym = ?";
      connection.query(getPlanQuery, [appAcronym], (err, results) => {
        if (err) {
          console.error("Error fetching plan details:", err);
          return res.status(500).json({ status: "error", message: "Internal server error" });
        }
  
        if (results.length === 0) {
          return res.status(404).json({ status: "error", message: "No plans found for this application" });
        }
  
        // Send back the plan details (both MVP name and color) for the application
        res.status(200).json({
          status: "success",
          plans: results, // Return all plans with their MVP names and colors
        });
      });
    });
  };
  

module.exports = getPlanDetailsController;
