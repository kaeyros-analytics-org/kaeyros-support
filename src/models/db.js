const mysql = require('mysql');

//MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'new_support_ticketing'
  });
  

  db.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return;
    }
    console.log('Successfully connected to MySQL database');
  });
  
  module.exports = db;