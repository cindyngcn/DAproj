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

// Get all distinct groups
const getGroups = (req, res) => {
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'No token provided. Access denied.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ status: 'error', message: 'Invalid or expired token.' });
    }

    const query = `SELECT DISTINCT user_group_groupName AS name FROM user_group`;

    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching groups:', err);
        return res.status(500).json({ status: 'error', message: 'Failed to fetch groups' });
      }

      res.json({ groups: results.map(row => row.name) });
    });
  });
};

// Create a new group (Admin only)
const createGroup = (req, res) => {
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'No token provided. Access denied.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ status: 'error', message: 'Invalid or expired token.' });
    }

    const adminCheckQuery = 'SELECT * FROM user_group WHERE user_group_username = ? AND user_group_groupName = "admin"';
    connection.query(adminCheckQuery, [decoded.username], (err, adminResults) => {
      if (err) {
        console.error('Error checking admin status:', err);
        return res.status(500).json({ status: 'error', message: 'Failed to check admin status' });
      }

      if (adminResults.length === 0) {
        return res.status(403).json({ status: 'error', message: 'Access denied. Only admins can create groups.' });
      }

      const { groupName } = req.body;

      if (!groupName) {
        return res.status(400).json({ status: 'error', message: 'Group name is required.' });
      }

      // Insert new group (only if it doesn't exist)
      const insertGroupQuery = 'INSERT IGNORE INTO user_group (user_group_username, user_group_groupName) VALUES (?, ?)';
      connection.query(insertGroupQuery, ['admin', groupName], (err, results) => {
        if (err) {
          console.error('Error creating group:', err);
          return res.status(500).json({ status: 'error', message: 'Failed to create group' });
        }

        if (results.affectedRows === 0) {
          return res.status(400).json({ status: 'error', message: 'Group already exists.' });
        }

        res.status(201).json({ status: 'success', message: 'Group created successfully.' });
      });
    });
  });
};

module.exports = { getGroups, createGroup };
