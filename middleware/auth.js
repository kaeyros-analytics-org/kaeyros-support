const jwt = require('jsonwebtoken');
const db = require('../Database/db'); 

async function authenticate(req, res, next) {
 const token = req.headers['auth-token'];
 if (!token) return res.status(401).json({ msg: 'Access denied. No token provided.' });

 try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  req.customer_id = decoded.user_id;

  db.query('SELECT role FROM customers WHERE id = ?', [req.customer_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to retrieve user role..' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    req.role = results[0].role;
    next();
  });
 } catch (err) {        
  console.error('Authentication Error:', err);
  return res.status(401).json({ msg: 'Invalid token.' });
 }
}

module.exports = authenticate;
