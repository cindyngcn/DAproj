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

const createTaskController = (req, res) => {
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ status: "error", message: "No token provided. Access denied." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ status: "error", message: "Invalid or expired token." });
    }

    const { Task_name, Task_description, Task_notes, Task_plan, Task_app_Acronym } = req.body;
    const Task_creator = decoded.username;
    const Task_state = "OPEN";
    const Task_createDate = new Date().toISOString().slice(0, 19).replace("T", " ");
    const Task_owner = Task_creator;

    // Fetch App_RNumber from the application table
    const getAppQuery = "SELECT App_RNumber FROM application WHERE App_Acronym = ?";
    connection.query(getAppQuery, [Task_app_Acronym], (err, appResults) => {
      if (err) {
        console.error("Error querying application table:", err);
        return res.status(500).json({ status: "error", message: "Internal server error" });
      }

      if (appResults.length === 0) {
        return res.status(400).json({ status: "error", message: "Application acronym does not exist." });
      }

      const App_RNumber = appResults[0].App_RNumber;

      // Fetch the highest Task_id for the given App_Acronym
      const getLastTaskQuery = "SELECT Task_id FROM task WHERE Task_app_Acronym = ? ORDER BY Task_id DESC LIMIT 1";
      connection.query(getLastTaskQuery, [Task_app_Acronym], (err, taskResults) => {
        if (err) {
          console.error("Error querying task table:", err);
          return res.status(500).json({ status: "error", message: "Internal server error" });
        }

        // Generate the new Task_id based on the App_RNumber
        let newTaskId = `${Task_app_Acronym}_${App_RNumber}`;
        let nextTaskNumber = App_RNumber;

        if (taskResults.length > 0) {
          const lastTaskId = taskResults[0].Task_id;
          const lastTaskNumber = parseInt(lastTaskId.split('_')[1], 10);
          nextTaskNumber = lastTaskNumber + 1;
          newTaskId = `${Task_app_Acronym}_${nextTaskNumber}`;
        }

        // Fetch Plan_color if Task_plan is provided, otherwise use default color
        if (Task_plan) {
          const getPlanColorQuery = "SELECT Plan_color FROM plan WHERE Plan_MVP_name = ?";
          connection.query(getPlanColorQuery, [Task_plan], (err, planResults) => {
            if (err) {
              console.error("Error fetching plan color:", err);
              return res.status(500).json({ status: "error", message: "Internal server error" });
            }

            let Plan_color = planResults.length > 0 ? planResults[0].Plan_color : "#6e7f7e";

            // Insert task into the database
            insertTask(newTaskId, Task_name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate, Plan_color, nextTaskNumber, res);
          });
        } else {
          // No Task_plan selected, assign default color 
          insertTask(newTaskId, Task_name, Task_description, Task_notes, null, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate, "#6e7f7e", nextTaskNumber, res);
        }
      });
    });
  });
};

// Helper function to insert task into the database
const insertTask = (Task_id, Task_name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate, Plan_color, nextTaskNumber, res) => {
  const insertTaskQuery = "INSERT INTO task (Task_id, Task_name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

  connection.query(insertTaskQuery, [Task_id, Task_name, Task_description || "", Task_notes || "", Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate, Plan_color], (err) => {
    if (err) {
      console.error("Error inserting task into database:", err);
      return res.status(500).json({ status: "error", message: "Internal server error" });
    }

    // Update App_RNumber for the next task
    const updateAppRNumberQuery = "UPDATE application SET App_RNumber = ? WHERE App_Acronym = ?";
    connection.query(updateAppRNumberQuery, [nextTaskNumber, Task_app_Acronym], (err) => {
      if (err) {
        console.error("Error updating App_RNumber:", err);
        return res.status(500).json({ status: "error", message: "Internal server error" });
      }

      res.status(201).json({
        status: "success",
        message: "Task created successfully.",
        taskId: Task_id,
        Task_plan: Task_plan || "...",  // Return "..." if no plan is selected
        Plan_color,
      });
    });
  });
};

module.exports = createTaskController;