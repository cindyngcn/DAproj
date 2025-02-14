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

// Update application logic (can update everything except App_Acronym and App_RNumber)
const updateAppController = (req, res) => {
    const token = req.cookies.authToken;
    if (!token) {
      return res.status(401).json({ status: "error", message: "No token provided. Access denied." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ status: "error", message: "Invalid or expired token." });
      }
      //I removed App_Acronym here
      const { App_Acronym, App_Description, App_startDate, App_endDate, permissions, App_RNumber } = req.body;
      const { appAcronym } = req.params; // The acronym of the app to update (from URL params)

      // Log the received data
      console.log("Received data:", req.body);
      console.log("Received request body:", req.body);
      console.log("Received URL params:", req.params);


      // Ensure the acronym is not being changed
      /*if (appAcronym !== App_Acronym) {
        return res.status(400).json({ status: "error", message: "Acronym cannot be changed" });
      }*/

      if (!appAcronym) {
        return res.status(400).json({ status: "error", message: "Missing application acronym in URL" });
      }

      // Optionally: Ensure the App_RNumber is not changed
      if (App_RNumber) {
        return res.status(400).json({ status: "error", message: "R Number cannot be changed" });
      }

      // Prepare the update fields (app description, dates, permissions)
      const permissionFields = {
        App_permit_Create: permissions?.App_permit_Create || null,
        App_permit_Open: permissions?.App_permit_Open || null,
        App_permit_toDoList: permissions?.App_permit_toDoList || null,
        App_permit_Doing: permissions?.App_permit_Doing || null,
        App_permit_Done: permissions?.App_permit_Done || null
      };

      // Log the SQL query and parameters
      const updateAppQuery = `
        UPDATE application SET
          App_Description = ?,
          App_startDate = ?,
          App_endDate = ?,
          App_permit_Create = ?,
          App_permit_Open = ?,
          App_permit_toDoList = ?,
          App_permit_Doing = ?,
          App_permit_Done = ?
        WHERE App_Acronym = ?`;

      console.log("Running SQL query:", updateAppQuery);
      console.log("SQL parameters:", [
        App_Description,
        App_startDate,
        App_endDate,
        permissionFields.App_permit_Create,
        permissionFields.App_permit_Open,
        permissionFields.App_permit_toDoList,
        permissionFields.App_permit_Doing,
        permissionFields.App_permit_Done,
        appAcronym
      ]);

      connection.query(
        updateAppQuery,
        [
          App_Description,
          App_startDate,
          App_endDate,
          permissionFields.App_permit_Create,
          permissionFields.App_permit_Open,
          permissionFields.App_permit_toDoList,
          permissionFields.App_permit_Doing,
          permissionFields.App_permit_Done,
          appAcronym
        ],
        (err) => {
          if (err) {
            console.error("Error updating application:", err);
            return res.status(500).json({ status: "error", message: "Internal server error" });
          }

          res.status(200).json({
            status: "success",
            message: "Application updated successfully",
          });
        }
      );
    });
};

module.exports = updateAppController;
