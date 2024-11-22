const mysql = require('mysql');

//MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  database: process.env.DB_NAME || 'new_support_ticketing',
  password: process.env.DB_PASS || '',
});


db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Successfully connected to MySQL database');
});

module.exports = db;
