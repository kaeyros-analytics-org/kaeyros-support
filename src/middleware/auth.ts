import jwt from 'jsonwebtoken';
import { Request, Response} from 'express';
import db from '../Database/db';
import { RowDataPacket } from 'mysql2';

const secret = process.env.JWT_SECRET || 'your_jwt_secret';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string; // Make sure role is included
    customer_id?: string;
  };
}



export const authenticate = async (req: AuthRequest, res: Response, next: Function): Promise<void> => {
  const token = req.header('auth-token');
  if (!token) {
    res.status(401).json({ msg: 'Unauthorized access. Token missing.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as { id: string; role: string };
    req.user = { id: decoded.id, role: decoded.role };

    // Verify the user still exists in the database
    const [results] = await db.query<RowDataPacket[]>('SELECT role FROM customers WHERE id = ?', [req.user.id]);
    if (results.length > 0) {
      req.user.role = results[0].role;
      next(); // Proceed to the next middleware
    } else {
      res.status(404).json({ error: 'User not found.' });
    }
  } catch (err) {
    res.status(401).json({ msg: 'Invalid or expired token.', error: err instanceof Error ? err.message : 'Unknown error' });
  }
};
// Authorize function remains unchanged
export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: Function): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ msg: 'Access denied.' });
      return;
    }
    next(); 
  };
};