import express from 'express';
import {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  getStats,
} from '../controllers/ticketsController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.post('/create', createTicket);
router.get('/all', authenticate, getAllTickets);
router.get('/:id', authenticate, getTicketById);
router.patch('/:id', authenticate, updateTicket);
router.delete('/:id', authenticate, deleteTicket);
router.get('/stats', authenticate, authorize(['admin']), getStats);

export default router;
