const mysql = require('mysql2');
require("dotenv").config();

// Create a database connection
const db = mysql.createConnection({

  host: process.env.DB_HOST || 'localhost',

  user: process.env.DB_USER,

  password: process.env.DB_PASSWORD,

  database: process.env.DB_NAME,

  port:process.env.DB_PORT

});

// Test the connection
db.connect((err) => {

  if (err) {

    console.error('Database connection failed:', err.message);
    return;

  }

  console.log('Database connected successfully');

});

module.exports = db.promise();