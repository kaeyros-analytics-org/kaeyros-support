const express = require('express');
const path = require('path');
const ticketsRoutes = require('./routes/tickets');
const customersRoutes = require('./routes/customers');

const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/tickets', ticketsRoutes);
app.use('/api/customers', customersRoutes);


app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
