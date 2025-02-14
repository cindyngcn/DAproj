const mysql = require("mysql2");
const dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken");  // Added import for jwt
const { generateColor } = require("../Utility/colorGenerator.js"); // Utility to generate random color

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

// Function to validate Plan_MVP_Name (alphanumeric, 1-50 characters)
const isValidMVPName = (name) => {
  const mvpNameRegex = /^[A-Za-z0-9 ]{1,50}$/;
  return mvpNameRegex.test(name);
};

// Plan creation logic
const createPlanController = (req, res) => {
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ status: "error", message: "No token provided. Access denied." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ status: "error", message: "Invalid or expired token." });
    }

    const { Plan_MVP_Name, Plan_startDate, Plan_endDate, Plan_color } = req.body;
    const appAcronym = req.params.appAcronym;

    // Validate MVP Name
    if (!isValidMVPName(Plan_MVP_Name)) {
      return res.status(400).json({ status: "error", message: "MVP Name must be alphanumeric and between 1-50 characters." });
    }

    // Validate Plan Color (if provided)
    let color = Plan_color;
    if (color && !/^#[0-9A-Fa-f]{6}$/i.test(color)) {
      return res.status(400).json({ status: "error", message: "Color must be in #RRGGBB hexadecimal format." });
    }

    // Auto-generate color if not provided
    if (!color) {
      color = generateColor(); // Utility function to generate random color
    }

    // Check if the application exists (Plan_app_Acronym must be valid)
    const checkAppQuery = "SELECT * FROM application WHERE App_Acronym = ?";
    connection.query(checkAppQuery, [appAcronym], (err, appResults) => {
      if (err) {
        console.error("Error querying the application table:", err);
        return res.status(500).json({ status: "error", message: "Internal server error" });
      }

      if (appResults.length === 0) {
        return res.status(400).json({ status: "error", message: "App_Acronym does not exist in the database." });
      }

      // Check if the plan already exists
      const checkPlanQuery = "SELECT * FROM plan WHERE Plan_MVP_name = ? AND Plan_app_Acronym = ?";
      connection.query(checkPlanQuery, [Plan_MVP_Name, appAcronym], (err, results) => {
        if (err) {
          console.error("Error querying the database:", err);
          return res.status(500).json({ status: "error", message: "Internal server error" });
        }

        if (results.length > 0) {
          return res.status(400).json({ status: "error", message: "Plan with this MVP Name already exists for this application." });
        }

        // Insert the new plan into the database
        const insertPlanQuery = "INSERT INTO plan (Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym, Plan_color) VALUES (?, ?, ?, ?, ?)";
        connection.query(insertPlanQuery, [Plan_MVP_Name, Plan_startDate, Plan_endDate, appAcronym, color], (err) => {
          if (err) {
            console.error("Error inserting plan into the database:", err);
            return res.status(500).json({ status: "error", message: "Internal server error" });
          }

          res.status(201).json({
            status: "success",
            message: "Plan created successfully.",
          });
        });
      });
    });
  });
};

module.exports = createPlanController;
