const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken'); // Import JWT
const dotenv = require('dotenv').config();

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

// Login logic
const loginController = (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM user WHERE username = ?'; 
  connection.query(query, [username], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Invalid credentials' });
    }

    const user = results[0];

    // Check if the account is enabled
    if (!user.enabled) {
      return res.status(403).json({ message: 'Account is disabled. Please contact the administrator.' });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).json({ status: 'error', message: 'Internal server error' });
      }

      if (!isMatch) {
        return res.status(400).json({ status: 'error', message: 'Invalid credentials' });
      }

      const { password, ...userDetails } = user;
      
      // Create JWT Token
      const token = jwt.sign(
        { username: user.username, ip: req.ip, browser_type: req.headers['user-agent'] }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' }
      );

      // Set cookie with the JWT token
      res.cookie('authToken', token, {
        httpOnly: true, // Prevent access via JavaScript
        sameSite: 'strict', // Protect against CSRF attacks
        maxAge: 3600000, // Cookie expiration time (1 hour in milliseconds)
      });

      // Send response with success message and user details
      res.status(200).json({
        status: 'success',
        message: 'Login successful. Welcome!',
        userDetails,
      });
    });
  });
};

module.exports = loginController;
