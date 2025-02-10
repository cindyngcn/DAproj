const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();
const mysql = require('mysql2');

// Set up the MySQL connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

// Authentication middleware
const authMiddleware = (req, res, next) => {
  //const token = req.cookies.token;
  const token = req.cookies.authToken;  // ✅ Ensure consistency

  // Check if the token is provided
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token using the JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.username; // Attach the decoded user information (username) to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(400).json({ status: 'error', message: 'Invalid token.' });
  }
};

// Protected Route - checkgroup
app.get('/checkgroup', authMiddleware, (req, res) => {
  const { username, groupName } = req.query;

  // Check if required fields are missing
  if (!username || !groupName) {
    console.error('Missing required fields:', { username, groupName });
    return res.status(400).json({ status: 'error', message: 'Username and group name are required.' });
  }

  // Query the database to check if the user belongs to the specified group
  const query = 'SELECT * FROM user_group WHERE user_group_username = ? AND user_group_groupName = ?';
  connection.query(query, [username, groupName], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }

    // If no results found, the user is not in the group
    if (results.length === 0) {
      return res.json({ status: 'success', inGroup: false });
    }

    // If the user is part of the group
    res.json({ status: 'success', inGroup: true });
  });
});

// Make sure to handle errors for undefined routes
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

module.exports = authMiddleware;


