const jwt = require('jsonwebtoken');
const db = require('../Database/db');

function authenticate(req, res, next) {
  const token = req.headers['auth-token'];
  console.log('Received Token:', token);
  if (!token) {
    return res.status(401).json({ msg: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.customer_id = decoded.id;

    // role
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
    console.error('Invalid token:', err);
    res.status(400).json({ msg: 'Invalid token.' });
  }

  // try {
  //   const decoded = jwt.verify(token, SECRET_KEY);
  //   req.user = decoded;
  //   next();
  //  } catch (error) {
  //   console.error('Authentication Error:', error);
  //   return res.status(401).json({ msg: 'Invalid token.' });
  //  }
}

module.exports = authenticate;
