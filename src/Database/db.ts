import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'new_support_ticketing2',
  password: 'new_password',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});



async function connectToDatabase() {
  try {
    await pool.getConnection();
    console.log('Successfully connected to MySQL database');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  }
}

connectToDatabase();

export default pool;
