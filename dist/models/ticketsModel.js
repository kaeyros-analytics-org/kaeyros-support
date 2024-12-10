"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../Database/db"));
class TicketsModel {
    static getTicketCountByProject(project) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield db_1.default.query('SELECT COUNT(*) AS count FROM tickets WHERE project = ?', [project]);
            return rows[0].count;
        });
    }
    static createTicket(ticket) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield db_1.default.query('INSERT INTO tickets SET ?', ticket);
            return Object.assign({ id: result.insertId }, ticket);
        });
    }
    static getAllTickets() {
        return __awaiter(this, arguments, void 0, function* (filter = {}) {
            const { status, priority } = filter;
            let query = 'SELECT * FROM tickets';
            const parameters = [];
            if (status || priority) {
                const whereClauses = [];
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
            const [rows] = yield db_1.default.query(query, parameters);
            return rows;
        });
    }
    static getTicketsByCustomerId(customer_id_1) {
        return __awaiter(this, arguments, void 0, function* (customer_id, filter = {}) {
            const { status, priority } = filter;
            let query = 'SELECT * FROM tickets WHERE customer_id = ?';
            const parameters = [customer_id];
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
            const [rows] = yield db_1.default.query(query, parameters);
            return rows;
        });
    }
    static getTicketById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield db_1.default.query('SELECT * FROM tickets WHERE id = ?', [id]);
            return rows[0];
        });
    }
    static updateTicket(id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield db_1.default.query('UPDATE tickets SET ? WHERE id = ?', [updates, id]);
            return result.affectedRows ? Object.assign({ id }, updates) : null;
        });
    }
    static deleteTicket(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield db_1.default.query('DELETE FROM tickets WHERE id = ?', [id]);
            return result.affectedRows > 0;
        });
    }
    static getStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const stats = {};
            const [total] = yield db_1.default.query('SELECT COUNT(*) AS total FROM tickets');
            stats.totalTickets = total[0].total;
            const [open] = yield db_1.default.query("SELECT COUNT(*) AS open FROM tickets WHERE status = 'open'");
            stats.openTickets = open[0].open;
            const [closed] = yield db_1.default.query("SELECT COUNT(*) AS closed FROM tickets WHERE status = 'closed'");
            stats.closedTickets = closed[0].closed;
            const [byDepartment] = yield db_1.default.query('SELECT department, COUNT(*) AS count FROM tickets GROUP BY department');
            stats.byDepartment = byDepartment;
            const [byType] = yield db_1.default.query('SELECT type, COUNT(*) AS count FROM tickets GROUP BY type');
            stats.byType = byType;
            const [topCreators] = yield db_1.default.query('SELECT customer_id, COUNT(*) AS count FROM tickets GROUP BY customer_id ORDER BY count DESC LIMIT 5');
            stats.topCreators = topCreators;
            return stats;
        });
    }
}
exports.default = TicketsModel;
