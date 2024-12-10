import pool from '../Database/db';

class TicketsModel {
  static async getTicketCountByProject(project: string) {
    const [rows]: any = await pool.query('SELECT COUNT(*) AS count FROM tickets WHERE project = ?', [project]);
    return rows[0].count;
  }

  static async createTicket(ticket: any) {
    const [result]: any = await pool.query('INSERT INTO tickets SET ?', ticket);
    return { id: result.insertId, ...ticket };
  }

  static async getAllTickets(filter: any = {}) {
    const { status, priority } = filter;
    let query = 'SELECT * FROM tickets';
    const parameters: any[] = [];

    if (status || priority) {
      const whereClauses: string[] = [];
      if (status) {
        whereClauses.push('status = ?');
        parameters.push(status);
      }
      if (priority) {
        whereClauses.push('priority = ?');
        parameters.push(priority);
      }
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    const [rows]: any = await pool.query(query, parameters);
    return rows;
  }

  static async getTicketsByCustomerId(customer_id: number, filter: any = {}) {
    const { status, priority } = filter;
    let query = 'SELECT * FROM tickets WHERE customer_id = ?';
    const parameters: any[] = [customer_id];

    if (status || priority) {
      if (status) {
        query += ' AND status = ?';
        parameters.push(status);
      }
      if (priority) {
        query += ' AND priority = ?';
        parameters.push(priority);
      }
    }

    const [rows]: any = await pool.query(query, parameters);
    return rows;
  }

  static async getTicketById(id: string) {
    const [rows]: any = await pool.query('SELECT * FROM tickets WHERE id = ?', [id]);
    return rows[0];
  }

  static async updateTicket(id: string, updates: any) {
    const [result]: any = await pool.query('UPDATE tickets SET ? WHERE id = ?', [updates, id]);
    return result.affectedRows ? { id, ...updates } : null;
  }

  static async deleteTicket(id: string) {
    const [result]: any = await pool.query('DELETE FROM tickets WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getStats() {
    const stats: any = {};

    const [total]: any = await pool.query('SELECT COUNT(*) AS total FROM tickets');
    stats.totalTickets = total[0].total;

    const [open]: any = await pool.query("SELECT COUNT(*) AS open FROM tickets WHERE status = 'open'");
    stats.openTickets = open[0].open;

    const [closed]: any = await pool.query("SELECT COUNT(*) AS closed FROM tickets WHERE status = 'closed'");
    stats.closedTickets = closed[0].closed;

    const [byDepartment]: any = await pool.query('SELECT department, COUNT(*) AS count FROM tickets GROUP BY department');
    stats.byDepartment = byDepartment;

    const [byType]: any = await pool.query('SELECT type, COUNT(*) AS count FROM tickets GROUP BY type');
    stats.byType = byType;

    const [topCreators]: any = await pool.query('SELECT customer_id, COUNT(*) AS count FROM tickets GROUP BY customer_id ORDER BY count DESC LIMIT 5');
    stats.topCreators = topCreators;

    return stats;
  }
}

export default TicketsModel;
