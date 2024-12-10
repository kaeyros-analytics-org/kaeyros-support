"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ticketsController_1 = require("../controllers/ticketsController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/create', ticketsController_1.createTicket);
router.get('/all', auth_1.authenticate, ticketsController_1.getAllTickets);
router.get('/:id', auth_1.authenticate, ticketsController_1.getTicketById);
router.patch('/:id', auth_1.authenticate, ticketsController_1.updateTicket);
router.delete('/:id', auth_1.authenticate, ticketsController_1.deleteTicket);
router.get('/stats', auth_1.authenticate, (0, auth_1.authorize)(['admin']), ticketsController_1.getStats);
exports.default = router;
