const { JWT_SECRET } = require('../config');
const express = require('express');
const router = express.Router();
const db = require('../Database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/auth');

// Register a new customer
router.post('/register', async (req, res) => {
  const { name, email, phone_number, project, country, city, image, password, role } = req.body;

  if (!name || !email || !phone_number || !password) {
    return res.status(400).json({ msg: 'Please fill all the required fields.' });
  }

  const checkQuery = 'SELECT * FROM customers WHERE email = ?';
  db.query(checkQuery, [email], async (err, results) => {
    if (results.length > 0) {
      return res.status(400).json({ msg: 'Email is already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const insertQuery = `
      INSERT INTO customers (name, email, phone_number, project, country, city, image, password, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(insertQuery, [name, email, phone_number, project, country, city, image, hashedPassword, role], (err) => {
      if (err) return res.status(500).json({ error: 'Failed to register customer.' });
      res.status(201).json({ msg: 'Customer registered successfully.' });
    });
  });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check if email exists in the database
  const query = 'SELECT * FROM customers WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ msg: 'Email not found' });
    }

    const user = results[0];

    // Compare password with stored hash
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      if (!isMatch) {
        return res.status(400).json({ msg: 'Incorrect password' });
      }

      // Generate a JWT token
      const token = jwt.sign(
        { user_id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Send back token and user details (excluding password)
      const { password, ...userData } = user;
      res.status(200).json({
        msg: 'Login successful',
        token,
        user: userData,
      });
    });
  });
});

// Get user role
router.get('/get-role', authenticate, (req, res) => {
  res.status(200).json({ role: req.role });
});

// Get all customers (Admin only)
router.get('/all', authenticate, (req, res) => {
  if (req.role !== 'admin') return res.status(403).json({ msg: 'Access denied.' });

  const query = 'SELECT * FROM customers';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to retrieve customers.' });
    res.status(200).json(results);
  });
});

// Get customer by ID (Admin only)
// router.get('/:id', authenticate, (req, res) => {
//   if (req.role !== 'admin') return res.status(403).json({ msg: 'Access denied.' });

//   const query = 'SELECT * FROM customers WHERE id = ?';
//   db.query(query, [req.params.id], (err, results) => {
//     if (err || results.length === 0) return res.status(404).json({ msg: 'Customer not found.' });
//     res.status(200).json(results[0]);
//   });
// });

// Update customer information (Admin only)
router.put('/:id', authenticate, (req, res) => {
  if (req.role !== 'admin') return res.status(403).json({ msg: 'Access denied.' });

  const { name, email, phone_number, project, role, country, city } = req.body;
  const query = `
    UPDATE customers
    SET name = ?, email = ?, phone_number = ?, project = ?, role = ?, country = ?, city = ?
    WHERE id = ?
  `;
  db.query(query, [name, email, phone_number, project, role, country, city, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update customer.' });
    res.status(200).json({ msg: 'Customer updated successfully.' });
  });
});

// Delete customer (Admin only)
router.delete('/:id', authenticate, (req, res) => {
  if (req.role !== 'admin') return res.status(403).json({ msg: 'Access denied.' });

  const query = 'DELETE FROM customers WHERE id = ?';
  db.query(query, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to delete customer.' });
    res.status(200).json({ msg: 'Customer deleted successfully.' });
  });
});

// Display logged-in customer's profile information in the sidebar
router.get('/profile', authenticate, (req, res) => {
  const query = 'SELECT id, image, name, email, phone_number, role, project, created_at FROM customers WHERE id = ?';
  db.query(query, [req.customer_id], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ error: 'Failed to fetch user data' });
    }
    if (results.length === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(200).json(results[0]);
  });
});

module.exports = router;
