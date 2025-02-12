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

// Get applications (all or by specific acronym)
const getAppController = (req, res) => {
  const token = req.cookies.authToken; // Get the token from cookies

  if (!token) {
    return res.status(401).json({ status: "error", message: "No token provided. Access denied." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ status: "error", message: "Invalid or expired token." });
    }

    const { appAcronym } = req.params; // Getting the App_Acronym if provided

    let query;
    let params = [];

    if (appAcronym) {
      // If a specific application acronym is requested
      query = "SELECT * FROM application WHERE App_Acronym = ?";
      params = [appAcronym];
    } else {
      // If no acronym is provided, get all applications
      query = "SELECT * FROM application";
    }

    connection.query(query, params, (err, results) => {
      if (err) {
        console.error("Error fetching applications from the database:", err);
        return res.status(500).json({ status: "error", message: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ status: "error", message: "No applications found" });
      }

      res.status(200).json({
        status: "success",
        data: appAcronym ? results[0] : results, // Return a single object if fetching one, or array if fetching all
      });
    });
  });
};

module.exports = getAppController;
