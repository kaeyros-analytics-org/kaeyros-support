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
exports.getStats = exports.deleteTicket = exports.updateTicket = exports.getTicketById = exports.getAllTickets = exports.createTicket = void 0;
const ticketsModel_1 = __importDefault(require("../models/ticketsModel"));
const createTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { project, subject, type, description, priority, department } = req.body;
    const assigned_to = 'unassigned';
    const status = 'open';
    if (!project || !subject || !type || !description || !priority || !department) {
        res.status(400).json({ msg: 'Please fill all required fields.' });
        return;
    }
    try {
        const ticketCount = yield ticketsModel_1.default.getTicketCountByProject(project);
        const ticketId = `${project}#${String(ticketCount + 1).padStart(4, '0')}`;
        const newTicket = yield ticketsModel_1.default.createTicket({
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
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ msg: 'Error creating ticket.', error: errorMessage });
    }
});
exports.createTicket = createTicket;
const getAllTickets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, priority } = req.query;
        const role = req.user.role;
        const customerId = req.user.customer_id;
        let tickets;
        const filters = { status, priority };
        if (role === 'admin') {
            tickets = yield ticketsModel_1.default.getAllTickets(filters);
        }
        else {
            tickets = yield ticketsModel_1.default.getTicketsByCustomerId(customerId, filters);
        }
        res.status(200).json(tickets);
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ msg: 'Error fetching tickets.', error: errorMessage });
    }
});
exports.getAllTickets = getAllTickets;
const getTicketById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const ticket = yield ticketsModel_1.default.getTicketById(id);
        if (!ticket) {
            res.status(404).json({ msg: 'Ticket not found.' });
            return;
        }
        res.status(200).json(ticket);
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ msg: 'Error fetching ticket.', error: errorMessage });
    }
});
exports.getTicketById = getTicketById;
const updateTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status, assigned_to } = req.body;
    try {
        const role = req.user.role;
        if (role !== 'admin' && assigned_to) {
            res.status(403).json({ msg: 'Only admins can assign tickets.' });
            return;
        }
        const updatedTicket = yield ticketsModel_1.default.updateTicket(id, {
            status,
            assigned_to: role === 'admin' ? assigned_to : undefined,
        });
        if (!updatedTicket) {
            res.status(404).json({ msg: 'Ticket not found or no changes made.' });
            return;
        }
        res.status(200).json(updatedTicket);
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ msg: 'Error updating ticket.', error: errorMessage });
    }
});
exports.updateTicket = updateTicket;
const deleteTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const role = req.user.role;
        const customerId = req.user.customer_id;
        if (role === 'user') {
            const ticket = yield ticketsModel_1.default.getTicketById(id);
            if (ticket.customer_id !== customerId) {
                res.status(403).json({ msg: 'Access denied.' });
                return;
            }
        }
        const deleted = yield ticketsModel_1.default.deleteTicket(id);
        if (!deleted) {
            res.status(404).json({ msg: 'Ticket not found.' });
            return;
        }
        res.status(200).json({ msg: 'Ticket deleted successfully.' });
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ msg: 'Error deleting ticket.', error: errorMessage });
    }
});
exports.deleteTicket = deleteTicket;
const getStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield ticketsModel_1.default.getStats();
        res.status(200).json(stats);
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ msg: 'Error fetching stats.', error: errorMessage });
    }
});
exports.getStats = getStats;
