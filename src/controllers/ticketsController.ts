import { Request, Response } from 'express';
import TicketsModel from '../models/ticketsModel';

export const createTicket = async (req: any, res: Response): Promise<void> => {
  const { project, subject, type, description, priority, department } = req.body;
  const assigned_to = 'unassigned';
  const status = 'open';

  if (!project || !subject || !type || !description || !priority || !department) {
    res.status(400).json({ msg: 'Please fill all required fields.' });
    return;
  }

  try {
    const ticketCount = await TicketsModel.getTicketCountByProject(project);
    const ticketId = `${project}#${String(ticketCount + 1).padStart(4, '0')}`;

    const newTicket = await TicketsModel.createTicket({
      project,
      subject,
      type,
      description,
      priority,
      department,
      assigned_to,
      status,
      ticketId,
    });

    res.status(201).json(newTicket);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ msg: 'Error creating ticket.', error: errorMessage });
  }
};

export const getAllTickets = async (req: any, res: Response): Promise<void> => {
  try {
    const { status, priority } = req.query;
    const role = req.user.role;
    const customerId = req.user.customer_id;

    let tickets;
    const filters = { status, priority };

    if (role === 'admin') {
      tickets = await TicketsModel.getAllTickets(filters);
    } else {
      tickets = await TicketsModel.getTicketsByCustomerId(customerId, filters);
    }

    res.status(200).json(tickets);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ msg: 'Error fetching tickets.', error: errorMessage });
  }
};

export const getTicketById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const ticket = await TicketsModel.getTicketById(id);
    if (!ticket) {
      res.status(404).json({ msg: 'Ticket not found.' });
      return;
    }
    res.status(200).json(ticket);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ msg: 'Error fetching ticket.', error: errorMessage });
  }
};

export const updateTicket = async (req: any, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, assigned_to } = req.body;

  try {
    const role = req.user.role;
    if (role !== 'admin' && assigned_to) {
      res.status(403).json({ msg: 'Only admins can assign tickets.' });
      return;
    }

    const updatedTicket = await TicketsModel.updateTicket(id, {
      status,
      assigned_to: role === 'admin' ? assigned_to : undefined,
    });

    if (!updatedTicket) {
      res.status(404).json({ msg: 'Ticket not found or no changes made.' });
      return;
    }

    res.status(200).json(updatedTicket);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ msg: 'Error updating ticket.', error: errorMessage });
  }
};

export const deleteTicket = async (req: any, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const role = req.user.role;
    const customerId = req.user.customer_id;

    if (role === 'user') {
      const ticket = await TicketsModel.getTicketById(id);
      if (ticket.customer_id !== customerId) {
        res.status(403).json({ msg: 'Access denied.' });
        return;
      }
    }

    const deleted = await TicketsModel.deleteTicket(id);
    if (!deleted) {
      res.status(404).json({ msg: 'Ticket not found.' });
      return;
    }

    res.status(200).json({ msg: 'Ticket deleted successfully.' });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ msg: 'Error deleting ticket.', error: errorMessage });
  }
};

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await TicketsModel.getStats();
    res.status(200).json(stats);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ msg: 'Error fetching stats.', error: errorMessage });
  }
};

