const express = require('express');
const router = express.Router();
const db = require('../Database/db');
const authenticate = require('../middleware/auth');

// Create a new ticket
router.post('/create', authenticate, (req, res) => {
  const { project, subject, type, description, priority, department, assigned_to } = req.body;
  const customer_id = req.customer_id;
 
  if (!project || !subject || !type || !description || !priority || !department) {
   return res.status(400).json({ msg: 'Please fill all required fields.' });
  }
 
  // Query to count tickets in the project
  db.query(`SELECT COUNT(*) as count FROM tickets WHERE project = ?`, [project], (err, result) => {
    if (err) {
      console.error('Error counting tickets:', err);
      return res.status(500).json({ error: 'Failed to create ticket.' });
    }
 
    const ticketCount = result[0].count + 1;
    const formattedTicketId = `${project}#${String(ticketCount).padStart(4, '0')}`;
 
    // Insert the ticket
    const insertQuery = `
      INSERT INTO tickets 
      (customer_id, project, subject, type, description, priority, status, assigned_to, department, ticket_id)
      VALUES (?, ?, ?, ?, ?, ?, 'Open', ?, ?, ?)
    `;
    db.query(insertQuery, [customer_id, project, subject, type, description, priority, assigned_to, department, formattedTicketId], (err, result) => {
      if (err) {
        console.error('Error inserting ticket:', err);
        return res.status(500).json({ error: 'Failed to create ticket.' });
      }
      res.status(201).json({ msg: 'Ticket created successfully.', ticketId: formattedTicketId });
    });
  });
 });



// Get all tickets (admin sees all, users see only their own)
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

// Get ticket by ID (admin access to all, users only to their own)
// router.get('/:id', authenticate, (req, res) => {
//   const ticketId = req.params.id;
//   const customer_id = req.customer_id;

//   const query = req.role === 'admin'
//     ? 'SELECT * FROM tickets WHERE id = ?'
//     : 'SELECT * FROM tickets WHERE id = ? AND customer_id = ?';

//   const queryParams = req.role === 'admin' ? [ticketId] : [ticketId, customer_id];

//   db.query(query, queryParams, (err, results) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ error: 'Failed to retrieve ticket.' });
//     }
//     if (results.length === 0) {
//       return res.status(404).json({ msg: 'Ticket not found or access denied.' });
//     }
//     res.status(200).json(results[0]);
//   });
// });

// Update ticket status (users can only update their own tickets)
router.put('/:id', authenticate, (req, res) => {
  const ticketId = req.params.id;
  const customer_id = req.customer_id;
  const { status } = req.body;

  const query = req.role === 'admin'
    ? 'UPDATE tickets SET status = ? WHERE id = ?'
    : 'UPDATE tickets SET status = ? WHERE id = ? AND customer_id = ?';

  const queryParams = req.role === 'admin' ? [status, ticketId] : [status, ticketId, customer_id];

  db.query(query, queryParams, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update ticket status.' });
    }
    res.status(200).json({ msg: 'Ticket status updated successfully.' });
  });
});


router.put('/assign/:id', authenticate, (req, res) => {
  const ticketId = req.params.id;
  const customer_id = req.customer_id;
  const { assigned_to } = req.body;

  const query = req.role === 'admin'
    ? 'UPDATE tickets SET assigned_to = ? WHERE id = ?'
    : 'UPDATE tickets SET assigned_to = ? WHERE id = ? AND customer_id = ?';

  const queryParams = req.role === 'admin' ? [assigned_to, ticketId] : [assigned_to, ticketId, customer_id];

  db.query(query, queryParams, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update ticket assignation.' });
    }
    res.status(200).json({ msg: 'Ticket assignation updated successfully.' });
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





// Dashboard stats endpoint
router.get('/stats', authenticate, (req, res) => {
  if (req.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Only admins can view this information.' });
  }

  // Get total tickets count
  db.query('SELECT COUNT(*) AS totalTickets FROM tickets', (err, totalResult) => {
    if (err) {
      console.error("Error fetching total tickets count:", err);
      return res.status(500).json({ error: 'Failed to retrieve total tickets count.' });
    }
    const totalTickets = totalResult[0].totalTickets;

    // Get open tickets count
    db.query("SELECT COUNT(*) AS openTickets FROM tickets WHERE status = 'open'", (err, openResult) => {
      if (err) {
        console.error("Error fetching open tickets count:", err);
        return res.status(500).json({ error: 'Failed to retrieve open tickets count.' });
      }
      const openTickets = openResult[0].openTickets;

      // Get closed tickets count
      db.query("SELECT COUNT(*) AS closedTickets FROM tickets WHERE status = 'closed'", (err, closedResult) => {
        if (err) {
          console.error("Error fetching closed tickets count:", err);
          return res.status(500).json({ error: 'Failed to retrieve closed tickets count.' });
        }
        const closedTickets = closedResult[0].closedTickets;

        // Get number of customers
        db.query("SELECT COUNT(*) AS numCustomers FROM customers", (err, customersResult) => {
          if (err) {
            console.error("Error fetching customers count:", err);
            return res.status(500).json({ error: 'Failed to retrieve customers count.' });
          }
          const numCustomers = customersResult[0].numCustomers;

          // Get tickets by department
          db.query("SELECT department, COUNT(*) AS ticketCount FROM tickets GROUP BY department", (err, departmentResult) => {
            if (err) {
              console.error("Error fetching tickets by department:", err);
              return res.status(500).json({ error: 'Failed to retrieve tickets by department.' });
            }
            const ticketsByDepartment = departmentResult.map(row => ({
              name: row.department,
              count: row.ticketCount
            }));

            // Get tickets by type
            db.query("SELECT type, COUNT(*) AS ticketCount FROM tickets GROUP BY type", (err, typeResult) => {
              if (err) {
                console.error("Error fetching tickets by type:", err);
                return res.status(500).json({ error: 'Failed to retrieve tickets by type.' });
              }
              const ticketsByType = typeResult.map(row => ({
                name: row.type,
                count: row.ticketCount
              }));

              // Get top ticket creators
                db.query(`
                SELECT customers.name, COUNT(tickets.id) AS ticketCount 
                FROM tickets 
                JOIN customers ON tickets.customer_id = customers.id 
                GROUP BY customers.id 
                ORDER BY ticketCount DESC 
                LIMIT 3
              `, (err, topCreatorsResult) => {
                if (err) {
                  console.error("Error fetching top ticket creators:", err);
                  return res.status(500).json({ error: 'Failed to retrieve top ticket creators.' });
                }

                // Map the results to an array of creator objects with name and ticketCount properties
                const topCreators = topCreatorsResult.map(row => ({
                  name: row.name,
                  count: row.ticketCount
                }));

                // Send all collected stats in a response
                res.status(200).json({
                  totalTickets,
                  openTickets,
                  closedTickets,
                  numCustomers,
                  ticketsByDepartment,
                  ticketsByType,
                  topCreators
                });
              });
            });
          });
        });
      });
    });
  });
});

module.exports = router;
