const mysql = require('mysql2');

// Create a database connection
const db = mysql.createConnection({

  host: 'localhost',

  user: 'root',

  password: 'manager',

  database: 'student_management'

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