import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import bodyParser from 'body-parser';
import ticketsRoutes from './routes/tickets';
import customersRoutes from './routes/customers';
import responsesRoutes from './routes/responses';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/tickets', ticketsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/responses', responsesRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.use(express.static(path.join(__dirname, '../public')));