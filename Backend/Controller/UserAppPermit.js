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

const userAppPermitController = (req, res) => {
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ status: "error", message: "No token provided. Access denied." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ status: "error", message: "Invalid or expired token." });
    }

    const username = decoded.username;
    const { App_Acronym } = req.body; // Get App_Acronym from request body

    if (!App_Acronym) {
      return res.status(400).json({ status: "error", message: "App_Acronym is required." });
    }

    // Query to get the app's permission groups
    const getAppPermitsQuery = `
      SELECT App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done 
      FROM application 
      WHERE App_Acronym = ?;
    `;

    connection.query(getAppPermitsQuery, [App_Acronym], (err, appResults) => {
      if (err) {
        console.error("Error fetching application permissions:", err);
        return res.status(500).json({ status: "error", message: "Internal server error." });
      }

      if (appResults.length === 0) {
        return res.status(404).json({ status: "error", message: "Application not found." });
      }

      const appPermissions = appResults[0]; // Get permit values as an object

      // Query to get user's groups
      const getUserGroupsQuery = `SELECT user_group_groupName FROM user_group WHERE user_group_username = ?;`;

      connection.query(getUserGroupsQuery, [username], (err, userResults) => {
        if (err) {
          console.error("Error fetching user groups:", err);
          return res.status(500).json({ status: "error", message: "Internal server error." });
        }

        if (userResults.length === 0) {
          return res.status(403).json({ status: "error", message: "User has no assigned groups." });
        }

        const userGroups = userResults.map(row => row.user_group_groupName);

        // Check each permission type
        const userPermissions = {
          Create: userGroups.includes(appPermissions.App_permit_Create),
          Open: userGroups.includes(appPermissions.App_permit_Open),
          ToDo: userGroups.includes(appPermissions.App_permit_toDoList),
          Doing: userGroups.includes(appPermissions.App_permit_Doing),
          Done: userGroups.includes(appPermissions.App_permit_Done),
        };

        // Check if the user has **any** permission
        const hasAnyPermission = Object.values(userPermissions).some(Boolean);

        if (hasAnyPermission) {
          res.status(200).json({
            status: "success",
            message: "User has permission for this application.",
            userPermissions
          });
        } else {
          res.status(403).json({
            status: "error",
            message: "User does not have any permission for this application.",
            userPermissions
          });
        }
      });
    });
  });
};

module.exports = userAppPermitController;
