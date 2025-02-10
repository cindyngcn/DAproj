const bcrypt = require("bcryptjs");
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

// Update user logic
const updateUserController = (req, res) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "No token provided. Access denied.",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err) => {
    if (err) {
      return res
        .status(403)
        .json({ status: "error", message: "Invalid or expired token." });
    }

    const { username, password, email, enabled, group } = req.body;

    // 🚨 Prevent disabling the hardcoded admin
    if (username === "Admin1" && enabled === false) {
      return res
        .status(400)
        .json({ message: "Hardcoded admin cannot be disabled." });
    }

    // Hash the password if it's being updated
    let updateQuery = "UPDATE user SET email = ?, enabled = ? WHERE username = ?";
    const queryParams = [email, enabled, username];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery =
        "UPDATE user SET password = ?, email = ?, enabled = ? WHERE username = ?";
      queryParams.unshift(hashedPassword);
    }

    // Update user table
    connection.query(updateQuery, queryParams, (err) => {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({
          status: "error",
          message: "Internal server error",
        });
      }

      // Remove existing group assignments for the user
      const deleteGroupQuery =
        "DELETE FROM user_group WHERE user_group_username = ?";
      connection.query(deleteGroupQuery, [username], (err) => {
        if (err) {
          console.error("Error deleting old group:", err);
          return res.status(500).json({
            status: "error",
            message: "Internal server error",
          });
        }

        // Insert new group(s) for the user
        if (group) {
          // Handle multiple groups
          for (let g of group) {
            const insertGroupQuery =
              "INSERT INTO user_group (user_group_username, user_group_groupName) VALUES (?, ?)";
            connection.query(insertGroupQuery, [username, g], (err) => {
              if (err) {
                console.error("Error updating group:", err);
                return res.status(500).json({
                  status: "error",
                  message: "Internal server error",
                });
              }
            });
          }
        } else {
          // Single group handling (for backward compatibility)
          const insertGroupQuery =
            "INSERT INTO user_group (user_group_username, user_group_groupName) VALUES (?, ?)";
          connection.query(insertGroupQuery, [username, group], (err) => {
            if (err) {
              console.error("Error updating group:", err);
              return res.status(500).json({
                status: "error",
                message: "Internal server error",
              });
            }
          });
        }

        // Send success response
        res.status(200).json({
          status: "success",
          message: "User updated successfully",
        });
      });
    });
  });
};

module.exports = updateUserController;
