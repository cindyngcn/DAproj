/*const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

// Set up the MySQL connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database!');
});

// Function to validate password
const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/;
  return passwordRegex.test(password);
};

// Create user logic
const createUserController = (req, res) => {
  // Verify token from cookies
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'No token provided. Access denied.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ status: 'error', message: 'Invalid or expired token.' });
    }

    const { username, password, email, group } = req.body;

    // Validate password format
    if (!isValidPassword(password)) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be 8-10 characters long and contain alphabets, numbers, and a special character.',
      });
    }

    // Check if user already exists
    const checkUserQuery = 'SELECT * FROM user WHERE username = ?';
    connection.query(checkUserQuery, [username], (err, results) => {
      if (err) {
        console.error('Error querying the database:', err);
        return res.status(500).json({ status: 'error', message: 'Internal server error' });
      }

      if (results.length > 0) {
        return res.status(400).json({ status: 'error', message: 'User already exists' });
      }

      // Hash password before storing
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          console.error('Error hashing password:', err);
          return res.status(500).json({ status: 'error', message: 'Internal server error' });
        }

        // Insert user into `user` table
        const insertUserQuery = 'INSERT INTO user (username, password, email, enabled) VALUES (?, ?, ?, ?)';
        connection.query(insertUserQuery, [username, hashedPassword, email, true], (err) => {
          if (err) {
            console.error('Error inserting user into the database:', err);
            return res.status(500).json({ status: 'error', message: 'Internal server error' });
          }

          // Insert user into `user_group` table
          const insertGroupQuery = 'INSERT INTO user_group (user_group_username, user_group_groupName) VALUES (?, ?)';
          connection.query(insertGroupQuery, [username, group], (err) => {
            if (err) {
              console.error('Error associating user with group:', err);
              return res.status(500).json({ status: 'error', message: 'Failed to associate user with group' });
            }

            res.status(201).json({
              status: 'success',
              message: 'User created successfully and assigned to group.',
            });
          });
        });
      });
    });
  });
};

module.exports = createUserController;*/

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

// Function to validate password
const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/;
  return passwordRegex.test(password);
};

// Create user logic (with multiple groups support)
const createUserController = (req, res) => {
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ status: "error", message: "No token provided. Access denied." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ status: "error", message: "Invalid or expired token." });
    }

    const { username, password, email, groups } = req.body; // ✅ groups should be an array

    // Validate password format
    if (!isValidPassword(password)) {
      return res.status(400).json({
        status: "error",
        message: "Password must be 8-10 characters long and contain alphabets, numbers, and a special character.",
      });
    }

    // Check if user already exists
    const checkUserQuery = "SELECT * FROM user WHERE username = ?";
    connection.query(checkUserQuery, [username], (err, results) => {
      if (err) {
        console.error("Error querying the database:", err);
        return res.status(500).json({ status: "error", message: "Internal server error" });
      }

      if (results.length > 0) {
        return res.status(400).json({ status: "error", message: "User already exists" });
      }

      // Hash password before storing
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          console.error("Error hashing password:", err);
          return res.status(500).json({ status: "error", message: "Internal server error" });
        }

        // Insert user into `user` table
        const insertUserQuery = "INSERT INTO user (username, password, email, enabled) VALUES (?, ?, ?, ?)";
        connection.query(insertUserQuery, [username, hashedPassword, email, true], (err) => {
          if (err) {
            console.error("Error inserting user into the database:", err);
            return res.status(500).json({ status: "error", message: "Internal server error" });
          }

          // ✅ Insert multiple groups
          /*if (groups && groups.length > 0) {
            const insertGroupQuery =
              "INSERT INTO user_group (user_group_username, user_group_groupName) VALUES (?, ?)";
            groups.forEach((group) => {
              connection.query(insertGroupQuery, [username, group], (err) => {
                if (err) {
                  console.error("Error associating user with group:", err);
                }
              });
            });
          }*/

            if (groups) {
              // Handle multiple groups
              for (let gg of groups) {
                const insertGroupQuery =
                  "INSERT INTO user_group (user_group_username, user_group_groupName) VALUES (?, ?)";
                connection.query(insertGroupQuery, [username, gg], (err) => {
                  if (err) {
                    console.error("Error updating group:", err);
                    return res.status(500).json({
                      status: "error",
                      message: "Internal server error",
                    });
                  }
                });
              }
            }

          res.status(201).json({
            status: "success",
            message: "User created successfully and assigned to group(s).",
          });
        });
      });
    });
  });
};

module.exports = createUserController;