const express = require('express');
const router = express.Router();
const db = require('../Database/db');
const authenticate = require('../middleware/auth');

// POST endpoint to create a response for a specific ticket
router.post('/:ticketId/responses', authenticate, (req, res) => {
    const { response, images } = req.body;
    const ticket_id = req.params.ticketId;
    const sender = req.role === 'admin' ? 'admin' : 'user';
  
    if (!response) {
        return res.status(400).json({ msg: 'Response cannot be empty.' });
    }
  
    const query = `
        INSERT INTO responses (ticket_id, sender, response, image)
        VALUES (?, ?, ?, ?)
    `;
    db.query(query, [ticket_id, sender, response, images || null], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to send response.' });
        }
        res.status(201).json({ msg: 'Response sent successfully.' });
    });
  });
  
  // GET endpoint to retrieve all responses for a specific ticket
  router.get('/:ticketId/responses', authenticate, (req, res) => {
    const ticket_id = req.params.ticketId;
  
    const query = `
        SELECT * FROM responses WHERE ticket_id = ?
    `;
    db.query(query, [ticket_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to retrieve responses.' });
        }
        res.status(200).json(results);
    });
  });
  
  
  router.get('/latest-timestamp/:ticketId', (req, res) => {
    const { ticketId } = req.params;
    db.query(`
     SELECT MAX(created_at) as latest_response
     FROM responses
     WHERE ticket_id = ?
    `, [ticketId], (err, result) => {
     if (err) {
      console.error('Error fetching latest response timestamp:', err);
      res.status(500).json({ error: 'Failed to fetch latest response timestamp' });
      return;
     }
     if (result.length > 0) {
      res.json(result[0].latest_response); 
     } else {
      res.json(null); 
     }
    });
   });
  
  module.exports = router;