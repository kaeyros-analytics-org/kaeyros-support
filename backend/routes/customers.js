const express = require('express');
const router = express.Router();
const db = require('../Database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/auth');

// Register new customer
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ msg: 'Please enter all fields.' });
  }

  // Check email
  const checkQuery = 'SELECT * FROM customers WHERE email = ?';
  db.query(checkQuery, [email], async (err, results) => {
    if (results.length > 0) {
      return res.status(400).json({ msg: 'Email already registered.' });
    }

   //password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const insertQuery = 'INSERT INTO customers (name, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(insertQuery, [name, email, hashedPassword, role], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to register customer.' });
      }
      res.status(201).json({ msg: 'Customer registered successfully.' });
    });
  });
});

// Customer login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields.' });
  }

  const query = 'SELECT * FROM customers WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ msg: 'Invalid email or password.' });
    }

    const customer = results[0];
    const validPassword = await bcrypt.compare(password, customer.password);
    if (!validPassword) {
      return res.status(400).json({ msg: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: customer.id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.header('auth-token', token).json({ token });
  });
});

// Get all customers (admin-only)
router.get('/all', authenticate, (req, res) => {
  if (req.role !== 'admin') {
    return res.status(403).json({ msg: 'Access refused. Admins only.' });
  }

  const getAllCustomersQuery = 'SELECT id, name, email, role FROM customers';
  
  db.query(getAllCustomersQuery, (err, results) => {
    if (err) {
      console.error('Error fetching customers:', err);
      return res.status(500).json({ msg: 'Failed to retrieve customers.' });
    }

    if (results.length === 0) {
      return res.status(200).json({ msg: 'No customers found.' });
    }

    res.status(200).json({ customers: results });
  });
});

// Admin Dashboard if dannick does an admin dashboard (admin-only)
router.get('/admin-dashboard', authenticate, (req, res) => {
  if (req.role === 'admin') {
    res.send('Welcome, Admin! You have access to the admin dashboard.');
  } else {
    res.status(403).json({ msg: 'Access forbidden.' });
  }
});

// Update a customer (admin-only)
router.put('/:id', authenticate, (req, res) => {
  if (req.role !== 'admin') {
    return res.status(403).json({ msg: 'Access forbidden. Admins only.' });
  }

  const customerId = req.params.id;
  const { name, email, role } = req.body;

  const updateQuery = 'UPDATE customers SET name = ?, email = ?, role = ? WHERE id = ?';
  db.query(updateQuery, [name, email, role, customerId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ msg: 'Failed to update customer.' });
    }
    res.status(200).json({ msg: 'Customer updated successfully.' });
  });
});

// Delete a customer (admin-only)
router.delete('/:id', authenticate, (req, res) => {
  if (req.role !== 'admin') {
    return res.status(403).json({ msg: 'Access forbidden. Admins only.' });
  }

  const customerId = req.params.id;

  const deleteQuery = 'DELETE FROM customers WHERE id = ?';
  db.query(deleteQuery, [customerId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ msg: 'Failed to delete customer.' });
    }
    res.status(200).json({ msg: 'Customer deleted successfully.' });
  });
});

module.exports = router;
