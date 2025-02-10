const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
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

// Update Profile logic
const updateProfileController = (req, res) => {
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'No token provided. Access denied.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ status: 'error', message: 'Invalid or expired token.' });
    }

    const { email, password } = req.body;
    const username = decoded.username; // Get the username from the decoded token

    // If email is provided, update the email
    if (email) {
      const updateEmailQuery = 'UPDATE user SET email = ? WHERE username = ?';
      connection.query(updateEmailQuery, [email, username], (err) => {
        if (err) {
          console.error('Error updating email:', err);
          return res.status(500).json({ status: 'error', message: 'Internal server error' });
        }
      });
    }

    // If password is provided, update the password (and hash it)
    if (password) {
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          console.error('Error hashing password:', err);
          return res.status(500).json({ status: 'error', message: 'Internal server error' });
        }

        const updatePasswordQuery = 'UPDATE user SET password = ? WHERE username = ?';
        connection.query(updatePasswordQuery, [hashedPassword, username], (err) => {
          if (err) {
            console.error('Error updating password:', err);
            return res.status(500).json({ status: 'error', message: 'Internal server error' });
          }
        });
      });
    }

    res.status(200).json({ status: 'success', message: 'Profile updated successfully.' });
  });
};

module.exports = updateProfileController;
