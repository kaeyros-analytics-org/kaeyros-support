const express = require('express');
const router = express.Router();
const db = require('../Database/db');
const authenticate = require('../middleware/auth');

// Create a new ticket
router.post('/create', authenticate, (req, res) => {
  const { project, subject, type, description, priority } = req.body;
  const customer_id = req.customer_id;

  if (!project || !subject || !type || !description || !priority) {
    return res.status(400).json({ msg: 'Please fill all fields.' });
  }

  const query = `
    INSERT INTO tickets (customer_id, project, subject, type, description, priority)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [customer_id, project, subject, type, description, priority], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to create ticket.' });
    }
    res.status(201).json({ msg: 'Ticket created successfully.', ticketId: result.insertId });
  });
});

// Get all tickets (admin can see all, normal users can only see their own)
router.get('/all', authenticate, (req, res) => {
  if (req.role === 'admin') {
    db.query('SELECT * FROM tickets', (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to retrieve tickets.' });
      }
      res.status(200).json(results);
    });
  } else {
    db.query('SELECT * FROM tickets WHERE customer_id = ?', [req.customer_id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to retrieve tickets.' });
      }
      res.status(200).json(results);
    });
  }
});

// Get ticket by ID (admin has access to all)
router.get('/:id', authenticate, (req, res) => {
  const ticketId = req.params.id;
  const customer_id = req.customer_id;

  const query = req.role === 'admin'
    ? 'SELECT * FROM tickets WHERE id = ?'
    : 'SELECT * FROM tickets WHERE id = ? AND customer_id = ?';

  const queryParams = req.role === 'admin' ? [ticketId] : [ticketId, customer_id];

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to retrieve ticket.' });
    }
    if (results.length === 0) {
      return res.status(404).json({ msg: 'Ticket not found or access denied.' });
    }
    res.status(200).json(results[0]);
  });
});

// Update ticket (users can only update their own tickets)
router.put('/:id', authenticate, (req, res) => {
  const ticketId = req.params.id;
  const customer_id = req.customer_id;
  const { project, subject, type, description, priority, status } = req.body;

  const query = req.role === 'admin'
    ? 'UPDATE tickets SET project = ?, subject = ?, type = ?, description = ?, priority = ?, status = ? WHERE id = ?'
    : 'UPDATE tickets SET project = ?, subject = ?, type = ?, description = ?, priority = ?, status = ? WHERE id = ? AND customer_id = ?';

  const queryParams = req.role === 'admin'
    ? [project, subject, type, description, priority, status, ticketId]
    : [project, subject, type, description, priority, status, ticketId, customer_id];

  db.query(query, queryParams, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update ticket.' });
    }
    res.status(200).json({ msg: 'Ticket updated successfully.' });
  });
});

// Delete a ticket (users can only delete their own tickets)
router.delete('/:id', authenticate, (req, res) => {
  const ticketId = req.params.id;
  const customer_id = req.customer_id;

  const query = req.role === 'admin'
    ? 'DELETE FROM tickets WHERE id = ?'
    : 'DELETE FROM tickets WHERE id = ? AND customer_id = ?';

  const queryParams = req.role === 'admin' ? [ticketId] : [ticketId, customer_id];

  db.query(query, queryParams, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to delete ticket.' });
    }
    res.status(200).json({ msg: 'Ticket deleted successfully.' });
  });
});



// Send a message
router.post('/message', authenticate, (req, res) => {
  const { sender, response, image} = req.body;

  const query = `
    INSERT INTO responses (ticket_id, sender, response, image)
    VALUES (?, ?, ?, ?)
  `;
  db.query(query, [ticket_id, sender, response, image], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: '' });
    }
    res.status(201).json({ msg: '', ticketId: result.insertId });
  });
});


module.exports = router;
