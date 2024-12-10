import express from 'express';
import {
  createCustomer,
  loginCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customersController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.post('/register', createCustomer);
router.post('/login', loginCustomer);
router.get('/all', authenticate, authorize(['admin']), getAllCustomers); 
router.get('/:id', authenticate, getCustomerById);
router.patch('/:id', authenticate, updateCustomer);
router.delete('/:id', authenticate, authorize(['admin']), deleteCustomer);

export default router;

