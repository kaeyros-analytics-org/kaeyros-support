"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const responsesController_1 = require("../controllers/responsesController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/:ticketId/responses', auth_1.authenticate, responsesController_1.createResponse);
router.get('/:ticketId/responses', auth_1.authenticate, responsesController_1.getResponsesByTicketId);
router.get('/latest/:ticketId', auth_1.authenticate, responsesController_1.getLatestResponseTimestamp);
router.get('/count/:ticketId', auth_1.authenticate, responsesController_1.countResponsesByTicketId);
exports.default = router;
