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

// Function to validate acronym format (alphanumeric, up to 20 characters)
const isValidAcronym = (acronym) => {
  const acronymRegex = /^[A-Za-z0-9]{1,20}$/;
  return acronymRegex.test(acronym);
};

// Function to validate rNumber format (start with 0, integer)
const isValidRNumber = (rNumber) => {
  const rNumberRegex = /^0\d*$/; // Start with 0, followed by digits
  return rNumberRegex.test(rNumber) && Number.isInteger(Number(rNumber));
};

// Create application logic (with multiple permissions for groups)
const createAppController = (req, res) => {
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ status: "error", message: "No token provided. Access denied." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ status: "error", message: "Invalid or expired token." });
    }

    const { app_acronym, app_description, app_startDate, app_endDate, app_rNumber, permissions } = req.body;

    // Validate acronym format
    if (!isValidAcronym(app_acronym)) {
      return res.status(400).json({
        status: "error",
        message: "Acronym must be alphanumeric and up to 20 characters.",
      });
    }

    // Validate rNumber format
    if (!isValidRNumber(app_rNumber)) {
      return res.status(400).json({
        status: "error",
        message: "R.Number must start with 0 and be an integer.",
      });
    }

    // Check if application already exists
    const checkAppQuery = "SELECT * FROM application WHERE app_acronym = ?";
    connection.query(checkAppQuery, [app_acronym], (err, results) => {
      if (err) {
        console.error("Error querying the database:", err);
        return res.status(500).json({ status: "error", message: "Internal server error" });
      }

      if (results.length > 0) {
        return res.status(400).json({ status: "error", message: "Application already exists" });
      }

      // Insert application into `application` table
      const insertAppQuery = "INSERT INTO application (app_acronym, app_description, app_startDate, app_endDate, app_rNumber) VALUES (?, ?, ?, ?, ?)";
      connection.query(insertAppQuery, [app_acronym, app_description, app_startDate, app_endDate, app_rNumber], (err) => {
        if (err) {
          console.error("Error inserting application into the database:", err);
          return res.status(500).json({ status: "error", message: "Internal server error" });
        }

        // Insert permissions for each group (if provided)
        if (permissions) {
          Object.keys(permissions).forEach(groupName => {
            const groupPermissions = permissions[groupName];
            groupPermissions.forEach(permission => {
              const insertPermissionQuery =
                "INSERT INTO application_permissions (app_acronym, app_rNumber, user_group_groupName, permission) VALUES (?, ?, ?, ?)";
              connection.query(insertPermissionQuery, [app_acronym, app_rNumber, groupName, permission], (err) => {
                if (err) {
                  console.error("Error inserting permissions for group:", err);
                  return res.status(500).json({
                    status: "error",
                    message: "Internal server error while inserting permissions",
                  });
                }
              });
            });
          });
        }

        res.status(201).json({
          status: "success",
          message: "Application created successfully with permissions.",
        });
      });
    });
  });
};

module.exports = createAppController;
