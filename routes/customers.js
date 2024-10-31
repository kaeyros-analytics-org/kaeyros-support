const express = require('express');
const router = express.Router();
const db = require('../Database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/auth');

// Register new customer
router.post('/register', async (req, res) => {
  const { name, email, phone_number, project, password } = req.body;

  if (!name || !email || !phone_number || !password) {
    return res.status(400).json({ msg: 'Please fill all the fields.' });
  }

  // Check email
  const checkQuery = 'SELECT * FROM customers WHERE email = ?';
  db.query(checkQuery, [email], async (err, results) => {
    if (results.length > 0) {
      return res.status(400).json({ msg: 'Email already registered.' });
    }


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const insertQuery = 'INSERT INTO customers (name, email, phone_number, project, password) VALUES (?, ?, ?, ?, ?)';
    db.query(insertQuery, [name, email, phone_number, project, hashedPassword], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to register customer.' });
      }
      res.status(201).json({ msg: 'Customer registered successfully.' });
    });
  });
});


// Login
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

  const getAllCustomersQuery = 'SELECT id, name, email, phone_number, project, ticket_count, created_at, role FROM customers';
  
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



// Update a customer (admin-only)
router.put('/:id', authenticate, (req, res) => {
  if (req.role !== 'admin') {
    return res.status(403).json({ msg: 'Access forbidden. Admins only.' });
  }

  const customerId = req.params.id;
  const { name, email, phone_number, project, role } = req.body;

  const updateQuery = 'UPDATE customers SET name = ?, email = ?, phone_number = ?, project = ?, role = ? WHERE id = ?';
  db.query(updateQuery, [name, email, phone_number, project, role, customerId], (err, result) => {
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

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: 'Customer not found.' });
    }

    res.status(200).json({ msg: 'Customer deleted successfully.' });
  });
});


// Get user role
router.get('/get-role', authenticate, (req, res) => {
  const customerId = req.customer_id;
  const role = req.role;  // This is also set by the authenticate middleware

  if (!customerId) {
    return res.status(401).json({ msg: 'User not authenticated.' });
  }

  // Return the role in the response
  res.status(200).json({ role });
});


//user info in sidebar
// Get customer by ID (no admin check)
router.get('/:id', authenticate, (req, res) => {
  const customerId = req.params.id;

  const getCustomerByIdQuery = 'SELECT id, name, email, phone_number, project, created_at, role FROM customers WHERE id = ?';

  db.query(getCustomerByIdQuery, [customerId], (err, results) => {
    if (err) {
      console.error('Error fetching customer by ID:', err);
      return res.status(500).json({ msg: 'Failed to retrieve customer.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ msg: 'Customer not found.' });
    }

    res.status(200).json({ customer: results[0] });
  });
});



router.get('/profile', authenticate, async (req, res) => {
  try {
    const customer = await customer.findById(req.customer_id).select('name email phone_number role');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ msg: 'Error retrieving profile data' });
  }
});


module.exports = router;
