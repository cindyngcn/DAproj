const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

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

// Update application logic
const updateAppController = (req, res) => {
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ status: "error", message: "No token provided. Access denied." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ status: "error", message: "Invalid or expired token." });
    }

    const { App_Description, App_startDate, App_endDate, App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, App_RNumber } = req.body;
    const { appAcronym } = req.params;

    if (!appAcronym) {
      return res.status(400).json({ status: "error", message: "Missing application acronym in URL" });
    }

    if (App_RNumber) {
      return res.status(400).json({ status: "error", message: "R Number cannot be changed" });
    }

    // **Step 1: Get the existing values from the database**
    connection.query(
      "SELECT * FROM application WHERE App_Acronym = ?",
      [appAcronym],
      (err, results) => {
        if (err) {
          console.error("Error fetching existing application:", err);
          return res.status(500).json({ status: "error", message: "Internal server error" });
        }

        if (results.length === 0) {
          return res.status(404).json({ status: "error", message: "Application not found" });
        }

        const existingApp = results[0]; // Get the existing record

        // **Step 2: Use existing values if new ones are not provided**
        const updatedApp = {
          App_Description: App_Description !== undefined ? App_Description : existingApp.App_Description,
          App_startDate: App_startDate !== undefined ? App_startDate : existingApp.App_startDate,
          App_endDate: App_endDate !== undefined ? App_endDate : existingApp.App_endDate,
          App_permit_Create: App_permit_Create !== undefined ? App_permit_Create : existingApp.App_permit_Create,
          App_permit_Open: App_permit_Open !== undefined ? App_permit_Open : existingApp.App_permit_Open,
          App_permit_toDoList: App_permit_toDoList !== undefined ? App_permit_toDoList : existingApp.App_permit_toDoList,
          App_permit_Doing: App_permit_Doing !== undefined ? App_permit_Doing : existingApp.App_permit_Doing,
          App_permit_Done: App_permit_Done !== undefined ? App_permit_Done : existingApp.App_permit_Done,
        };

        // **Step 3: Perform the update with only necessary changes**
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

        connection.query(
          updateAppQuery,
          [
            updatedApp.App_Description,
            updatedApp.App_startDate,
            updatedApp.App_endDate,
            updatedApp.App_permit_Create,
            updatedApp.App_permit_Open,
            updatedApp.App_permit_toDoList,
            updatedApp.App_permit_Doing,
            updatedApp.App_permit_Done,
            appAcronym,
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
      }
    );
  });
};

module.exports = updateAppController;
