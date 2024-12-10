import { Request, Response} from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import CustomersModel from '../models/customersModel';

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  const { name, email, phone_number, project, country, city, image, password, role } = req.body;

  if (!name || !email || !phone_number || !project || !password) {
    res.status(400).json({ msg: 'Please fill all required fields.' });
    return; // Ensure you return after sending a response
  }

  const existingCustomer = await CustomersModel.getCustomerByEmail(email);
  if (existingCustomer) {
    res.status(400).json({ msg: 'Email already exists.' });
    return; // Ensure you return after sending a response
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newCustomer = await CustomersModel.createCustomer({
    name,
    email,
    phone_number,
    project,
    country,
    city,
    image,
    password: hashedPassword,
    role: role || 'user', 
  });

  res.status(201).json(newCustomer);
};

//   } catch (err) {
//     const errorMessage = err instanceof Error ? err.message : 'Unknown error';
//     res.status(500).json({ msg: 'Error creating customer.', error: errorMessage });
//   }
// };

export const loginCustomer = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const customer = await CustomersModel.getCustomerByEmail(email);
  if (!customer) {
    res.status(404).json({ msg: 'Customer not found.' });
    return; // Ensure you return after sending a response
  }

  const isMatch = await bcrypt.compare(password, customer.password);
  if (!isMatch) {
    res.status(400).json({ msg: 'Invalid credentials.' });
    return; // Ensure you return after sending a response
  }

  const token = jwt.sign({ id: customer.id, role: customer.role }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });

  res.status(200).json({ token, customer: { id: customer.id, email: customer.email, role: customer.role } });
  
};



export const getAllCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const customers = await CustomersModel.getAllCustomers();
    res.status(200).json(customers);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ msg: 'Error fetching customers.', error: errorMessage });
    return;
  }
};

export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const customer = await CustomersModel.getCustomerById(id);
    if (!customer) {
      res.status(404).json({ msg: 'Customer not found.' });
      return; // Ensuring void return
    }
    res.status(200).json(customer); // Send response here
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ msg: 'Error retrieving customer.', error: errorMessage });
  }
};

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedCustomer = await CustomersModel.updateCustomer(id, updates);
    if (!updatedCustomer) {
      res.status(404).json({ msg: 'Customer not found' });
      return; // Ensuring void return
    }
    res.status(200).json(updatedCustomer); // Send response here
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ msg: 'Error updating customer.', error: errorMessage });
  }
};


export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const deleted = await CustomersModel.deleteCustomer(id);
    if (!deleted) {
      res.status(404).json({ msg: 'Customer not found.' });
      return; // Ensuring void return
    }
    res.status(200).json({ msg: 'Customer deleted successfully.' }); // Send response here
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ msg: 'Error deleting customer.', error: errorMessage });
  }
};
