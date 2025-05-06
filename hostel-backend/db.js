// db.js
const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool (better than single connection)
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'asdf@123',
  database: process.env.DB_NAME || 'hostel_management',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    throw err;
  }
  console.log('Connected to MySQL DB');
});

module.exports = connection;