// permission.js
/*const jwt = require('jsonwebtoken');

// Middleware to check if the user is an admin
const adminMiddleware = (req, res, next) => {
  const token = req.cookies.authToken;  // Get the token from cookies

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'No token provided. Access denied.' });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ status: 'error', message: 'Invalid or expired token.' });
    }

    // Check if the user is an admin
    if (decoded.isAdmin) {
      next(); // Proceed to the next middleware or route handler
    } else {
      return res.status(403).json({ status: 'error', message: 'Access denied. You are not an admin.' });
    }
  });
};

module.exports = { adminMiddleware };*/

const mysql = require("mysql2");
const jwt = require("jsonwebtoken");

// Set up the MySQL connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Function to check if a user belongs to a specific group
const checkGroup = (username, groupName) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM user_group 
      WHERE user_group_username = ? 
      AND user_group_groupName = ?
    `;

    connection.execute(query, [username, groupName], (error, results) => {
      if (error) {
        console.error("Error checking user group:", error);
        reject(error);
      } else {
        resolve(results.length > 0); // Returns true if user is in the group
      }
    });
  });
};

// Middleware to check if a user is in the admin group
const adminMiddleware = async (req, res, next) => {
  const token = req.cookies.authToken; // Get the token from cookies

  if (!token) {
    return res.status(401).json({ status: "error", message: "No token provided. Access denied." });
  }


  try {
    // Check if the user is in the admin group
    const isAdmin = await checkGroup(req.user, "admin");

    if (isAdmin) {
      next(); // Proceed to the next middleware or route handler
    } else {
      return res.status(403).json({ status: "error", message: "Access denied. You are not an admin." });
    }
  } catch (error) {
      console.error('Error AHHHHHH:', error);

    return res.status(500).json({ status: "error", message: "Internal server error." });
  }

};

// Middleware to check if a user belongs to the "PL" group
const plMiddleware = async (req, res, next) => {
  const token = req.cookies.authToken; // Get the token from cookies

  if (!token) {
    return res.status(401).json({ status: "error", message: "No token provided. Access denied." });
  }

  try {
    // Check if the user is in the "PL" group
    const isPL = await checkGroup(req.user, "PL");

    if (isPL) {
      next(); // Proceed to the next middleware or route handler
    } else {
      return res.status(403).json({ status: "error", message: "Access denied. You are not in the PL group." });
    }
  } catch (error) {
    console.error('Error checking PL group:', error);

    return res.status(500).json({ status: "error", message: "Internal server error." });
  }
};

module.exports = { adminMiddleware, plMiddleware, checkGroup };

