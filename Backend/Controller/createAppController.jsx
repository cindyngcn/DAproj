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

    const { App_Acronym, App_Description, App_startDate, App_endDate, App_RNumber, permissions } = req.body;

    // Validate acronym format
    if (!isValidAcronym(App_Acronym)) {
      return res.status(400).json({
        status: "error",
        message: "Acronym must be alphanumeric and up to 20 characters.",
      });
    }

    // Validate rNumber format
    if (!isValidRNumber(App_RNumber)) {
      return res.status(400).json({
        status: "error",
        message: "R.Number must start with 0 and be an integer.",
      });
    }

    // Check if application already exists
    const checkAppQuery = "SELECT * FROM application WHERE App_Acronym = ?";
    connection.query(checkAppQuery, [App_Acronym], (err, results) => {
      if (err) {
        console.error("Error querying the database:", err);
        return res.status(500).json({ status: "error", message: "Internal server error" });
      }

      if (results.length > 0) {
        return res.status(400).json({ status: "error", message: "Application already exists" });
      }

      // Log to verify the incoming permissions object
      console.log("Incoming Permissions:", permissions);

      // Insert application into `application` table, including permissions
      const insertAppQuery = `
        INSERT INTO application (
          App_Acronym, 
          App_Description, 
          App_startDate, 
          App_endDate, 
          App_RNumber, 
          App_permit_Create, 
          App_permit_Open, 
          App_permit_toDoList, 
          App_permit_Doing, 
          App_permit_Done
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      // Map permissions object fields correctly
      const permissionFields = {
        App_permit_Create: permissions?.App_permit_Create || null,
        App_permit_Open: permissions?.App_permit_Open || null,
        App_permit_toDoList: permissions?.App_permit_toDoList || null,
        App_permit_Doing: permissions?.App_permit_Doing || null,
        App_permit_Done: permissions?.App_permit_Done || null
      };

      connection.query(
        insertAppQuery, 
        [
          App_Acronym, 
          App_Description, 
          App_startDate, 
          App_endDate, 
          App_RNumber, 
          permissionFields.App_permit_Create, 
          permissionFields.App_permit_Open, 
          permissionFields.App_permit_toDoList, 
          permissionFields.App_permit_Doing, 
          permissionFields.App_permit_Done
        ], 
        (err) => {
          if (err) {
            console.error("Error inserting application into the database:", err);
            return res.status(500).json({ status: "error", message: "Internal server error" });
          }

          res.status(201).json({
            status: "success",
            message: "Application created successfully with permissions.",
          });
        }
      );
    });
  });
};

module.exports = createAppController;
