const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
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

const plainPassword = 'test1'; // Change this to the password you want to hash
const saltRounds = 10;

bcrypt.hash(plainPassword, saltRounds, (err, hashedPassword) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log('Hashed password:', hashedPassword);

  const query = 'UPDATE `user` SET `password` = ? WHERE `username` = ?';
  connection.query(query, [hashedPassword, 'test1'], (err, results) => {
    if (err) {
      console.error('Error updating password in the database:', err);
      return;
    }
    console.log('Password updated successfully!');
    connection.end();
  });
});
