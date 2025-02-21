const mysql = require("mysql2");
const jwt = require("jsonwebtoken");

// Set up the MySQL connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const { checkGroup } = require("./checkGroup");

/*const Permits = async (req, res, next) => {
  const token = req.cookies.authToken; // Get the token from cookies

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized. No token provided.' });
  }

  try {
    // Verify the token and decode user info
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the decoded user information to the request

    const data = req.body;

    const [taskResults] = await connection.promise().query(
      "SELECT * FROM task WHERE Task_id = ?",
      [data.task_id]
    );

    const [appResults] = await connection.promise().query(
      "SELECT * FROM application WHERE App_Acronym = ?",
      [data.appAcronym]
    );

    const state = taskResults[0].task_state;
    const app = appResults[0];
    let permitToCheck;

    if (state === "OPEN") {
      permitToCheck = app.app_permitOpen;
    } else if (state === "TODO") {
      permitToCheck = app.app_permitToDoList;
    } else if (state === "DOING") {
      permitToCheck = app.app_permitDoing;
    } else if (state === "DONE") {
      permitToCheck = app.app_permitDone;
    }

    const userHasPermission = await checkGroup(req.user.username, permitToCheck);

    if (userHasPermission) {
      next();
    } else {
      res.status(403).json({ message: "No permission." });
    }
  } catch (error) {
    console.error("Error verifying token or checking permissions:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};*/
const Permits = async (req, res, next) => {
    const token = req.cookies.authToken; // Get the token from cookies
  
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized. No token provided.' });
    }
  
    try {
      // Verify the token and decode user info
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach the decoded user information to the request
  
      const data = req.body;  // Assuming data from request body
  
      // Query task and application based on task_id and appAcronym from the request body
      const [taskResults] = await connection.promise().query(
        "SELECT * FROM task WHERE Task_id = ?",
        [data.task_id]
      );
  
      const [appResults] = await connection.promise().query(
        "SELECT * FROM application WHERE App_Acronym = ?",
        [data.appAcronym]
      );
  
      const state = taskResults[0].task_state;
      const app = appResults[0];
      let permitToCheck;
  
      // Determine the permit to check based on task state
      if (state === "OPEN") {
        permitToCheck = app.app_permitOpen;
      } else if (state === "TODO") {
        permitToCheck = app.app_permitToDoList;
      } else if (state === "DOING") {
        permitToCheck = app.app_permitDoing;
      } else if (state === "DONE") {
        permitToCheck = app.app_permitDone;
      }
  
      // Check if the user has the required permission
      const userHasPermission = await checkGroup(req.user.username, permitToCheck);
  
      if (userHasPermission) {
        next();  // Allow the request to proceed if permission is granted
      } else {
        res.status(403).json({ message: "No permission." });  // If no permission, respond with Forbidden
      }
    } catch (error) {
      console.error("Error verifying token or checking permissions:", error);
      return res.status(500).json({ message: "Internal server error." });  // Handle server error
    }
  };

module.exports = { Permits };
