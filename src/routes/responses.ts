import express from 'express';
import {
  createResponse,
  getResponsesByTicketId,
  getLatestResponseTimestamp,
  countResponsesByTicketId,
} from '../controllers/responsesController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/:ticketId/responses', authenticate, createResponse);
router.get('/:ticketId/responses', authenticate, getResponsesByTicketId);
router.get('/latest/:ticketId', authenticate, getLatestResponseTimestamp);
router.get('/count/:ticketId', authenticate, countResponsesByTicketId);

export default router;
