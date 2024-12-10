import pool from '../Database/db';

class ResponsesModel {
  static async createResponse(ticketId: string, sender: string, response: string, images: string | null) {
    const [result]: any = await pool.query('INSERT INTO responses SET ?', { ticketId, sender, response, images });
    return { id: result.insertId, ticketId, sender, response, images };
  }

  static async getResponsesByTicketId(ticketId: string) {
    const [rows]: any = await pool.query('SELECT * FROM responses WHERE ticketId = ?', [ticketId]);
    return rows;
  }

  static async getLatestResponseTimestamp(ticketId: string) {
    const [rows]: any = await pool.query('SELECT MAX(created_at) AS latest FROM responses WHERE ticketId = ?', [ticketId]);
    return rows[0].latest;
  }

  static async countResponsesByTicketId(ticketId: string) {
    const [rows]: any = await pool.query('SELECT COUNT(*) AS count FROM responses WHERE ticketId = ?', [ticketId]);
    return rows[0].count;
  }
}

export default ResponsesModel;
