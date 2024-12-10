import pool from '../Database/db';

class CustomersModel {
  static async getCustomerByEmail(email: string) {
    const [rows]: any = await pool.query('SELECT * FROM customers WHERE email = ?', [email]);
    return rows[0];
  }

  static async createCustomer(customer: any) {
    const [result]: any = await pool.query('INSERT INTO customers SET ?', customer);
    return { id: result.insertId, ...customer };
  }

  static async getAllCustomers() {
    const [rows]: any = await pool.query('SELECT id, name, email, phone_number, project, country, city, ticket_count FROM customers');
    return rows;
  }

  static async getCustomerById(id: string) {
    const [rows]: any = await pool.query('SELECT id, name, email, phone_number, project, country, city, ticket_count FROM customers WHERE id = ?', [id]);
    return rows[0];
  }

  static async updateCustomer(id: string, updates: any) {
    const [result]: any = await pool.query('UPDATE customers SET ? WHERE id = ?', [updates, id]);
    return result.affectedRows ? { id, ...updates } : null;
  }

  static async deleteCustomer(id: string) {
    const [result]: any = await pool.query('DELETE FROM customers WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

export default CustomersModel;
