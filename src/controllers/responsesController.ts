import { Request, Response } from 'express';
import ResponsesModel from '../models/responsesModel';

export const createResponse = async (req: any, res: Response) => {
  const { ticketId, response, images } = req.body;
  const sender = req.user.role === 'admin' ? 'admin' : req.user.customer_id;

  try {
    const newResponse = await ResponsesModel.createResponse(ticketId, sender, response, images || null);
    res.status(201).json(newResponse);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ msg: 'Error creating response.', error: errorMessage });
  }
};

export const getResponsesByTicketId = async (req: Request, res: Response) => {
  const { ticketId } = req.params;

  try {
    const responses = await ResponsesModel.getResponsesByTicketId(ticketId);
    res.status(200).json(responses);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ msg: 'Error fetching responses.', error: errorMessage });
  }
};

export const getLatestResponseTimestamp = async (req: Request, res: Response) => {
  const { ticketId } = req.params;

  try {
    const timestamp = await ResponsesModel.getLatestResponseTimestamp(ticketId);
    res.status(200).json({ latestResponseTimestamp: timestamp });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ msg: 'Error fetching latest response timestamp.', error: errorMessage });
  }
};

export const countResponsesByTicketId = async (req: Request, res: Response) => {
  const { ticketId } = req.params;

  try {
    const count = await ResponsesModel.countResponsesByTicketId(ticketId);
    res.status(200).json({ responseCount: count });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ msg: 'Error counting responses.', error: errorMessage });
  }
};
