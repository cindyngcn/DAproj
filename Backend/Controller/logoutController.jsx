const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken'); // Import JWT
const dotenv = require('dotenv').config();

const logoutController = (req, res) => {
    res.clearCookie("authToken");

      // Send response with success message and user details
      res.status(200).json({
        status: 'success',
        message: 'Logout successful.'
      });
    };

module.exports = logoutController;