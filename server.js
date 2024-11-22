require('dotenv').config();
const express = require('express');
const path = require('path');
const ticketsRoutes = require('./routes/tickets');
const customersRoutes = require('./routes/customers');
const responsesRoutes = require('./routes/responses');

const app = express();

//JSON Middleware 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/tickets', ticketsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/responses', responsesRoutes);


app.use(express.static(path.join(__dirname, 'public')));

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
