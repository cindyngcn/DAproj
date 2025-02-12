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

// Get application logic with token verification
const getAppController = (req, res) => {
  const token = req.cookies.authToken; // Get the token from cookies
  if (!token) {
    return res.status(401).json({ status: "error", message: "No token provided. Access denied." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ status: "error", message: "Invalid or expired token." });
    }

    const { appAcronym } = req.params; // Getting the App_Acronym from the route params

    // Query to fetch the application
    const getAppQuery = "SELECT * FROM application WHERE App_Acronym = ?";
    connection.query(getAppQuery, [appAcronym], (err, results) => {
      if (err) {
        console.error("Error fetching application from the database:", err);
        return res.status(500).json({ status: "error", message: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ status: "error", message: "Application not found" });
      }

      res.status(200).json({
        status: "success",
        data: results[0],
      });
    });
  });
};

module.exports = getAppController;
