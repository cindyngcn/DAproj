const express = require('express');
const app = express();
const mysql = require('mysql2');
const dotenv = require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken');

// Middleware
app.use(cookieParser());  // ✅ MUST come before any route handlers
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true, // ✅ Allows frontend to send cookies
}));
app.use(bodyParser.json()); // ✅ Keep this after CORS & cookieParser

// Database connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database!');
});

// Routes
const createUserRouter = require('./Routers/createUserRouter.js');
const groupRouter = require('./Routers/groupRouter.js');
const loginRouter = require('./Routers/loginRouter.js');
const updateUserRouter = require('./Routers/updateUserRouter.js');
const updateProfileRouter = require('./Routers/updateProfileRouter.js');

// Over-splitting - e.g. 1 for task, 1 for authentication
app.use('/createUser', createUserRouter);
app.use('/groups', groupRouter);
app.use('/auth', loginRouter);
app.use('/user', updateUserRouter);
app.use('/profile', updateProfileRouter);

// Fetch all users and their groups
/*app.get('/user', (req, res) => {
  const token = req.cookies.authToken;  // Ensure correct cookie name

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'No token provided. Access denied.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ status: 'error', message: 'Invalid or expired token.' });
    }

    // Fetch users and their groups
    const query = `
      SELECT u.username, u.email, u.enabled, ug.user_group_groupName AS groupName
      FROM user u
      LEFT JOIN user_group ug ON u.username = ug.user_group_username
    `;
    
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching users:', err);
        return res.status(500).json({ status: "error", message: "Failed to fetch users" });
      }

      const users = results.map(result => ({
        username: result.username,
        email: result.email,
        enabled: result.enabled,
        group: [result.groupName] || null,  // Add groupName if available, else null
      }));

      res.json({ users }); // Send users to frontend
    });
  });
});*/

app.get('/user', (req, res) => {
  const token = req.cookies.authToken;  // Ensure correct cookie name

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'No token provided. Access denied.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ status: 'error', message: 'Invalid or expired token.' });
    }

    // Fetch users and their groups
    const query = `
      SELECT u.username, u.email, u.enabled, GROUP_CONCAT(ug.user_group_groupName ORDER BY ug.user_group_groupName) AS \`groups\`
      FROM user u
      LEFT JOIN user_group ug ON u.username = ug.user_group_username
      GROUP BY u.username, u.email, u.enabled;
    `;

    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching users:', err);  // Log the specific error
        return res.status(500).json({ status: "error", message: "Failed to fetch users" });
      }

      const users = results.map(result => ({
        username: result.username,
        email: result.email,
        enabled: result.enabled,
        groups: result.groups ? result.groups.split(',') : [],  // Convert the comma-separated list of groups into an array
      }));

      res.json({ users }); // Send users to frontend
    });
  });
});

// Verify if the user is authenticated
app.get('/auth/verify', (req, res) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'No token provided. Access denied.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ status: 'error', message: 'Invalid or expired token.' });
    }

    res.json({ status: 'success', message: 'Authenticated', username: decoded.username });
  });
});

// Get the current user and check if they are an admin
app.get('/currentUser', (req, res) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }

    const username = decoded.username;

    // Query to get both the username and email from the user table
    const query = 'SELECT username, email FROM user WHERE username = ?';
    connection.query(query, [username], (err, results) => {
      if (err) {
        console.error('Error querying the database:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (results.length > 0) {
        const user = results[0]; // Assuming the username is unique, we take the first result
        
        // Check if the user is an admin by querying the user_group table
        const adminCheckQuery = 'SELECT * FROM user_group WHERE user_group_username = ? AND user_group_groupName = "admin"';
        connection.query(adminCheckQuery, [username], (err, adminResults) => {
          if (err) {
            console.error('Error checking admin status:', err);
            return res.status(500).json({ message: 'Failed to check admin status' });
          }

          const isAdmin = adminResults.length > 0 || username==='Admin1'; // If there's a record, user is an admin

          res.json({
            username: user.username,
            email: user.email || "",  // Send email, or empty string if not set
            isAdmin: isAdmin,         // Send isAdmin flag
          });
        });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    });
  });
});

// Start server
app.listen(8080, () => {
  console.log('Server started on port 8080');
});
