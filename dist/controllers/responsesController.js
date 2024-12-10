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
exports.countResponsesByTicketId = exports.getLatestResponseTimestamp = exports.getResponsesByTicketId = exports.createResponse = void 0;
const responsesModel_1 = __importDefault(require("../models/responsesModel"));
const createResponse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ticketId, response, images } = req.body;
    const sender = req.user.role === 'admin' ? 'admin' : req.user.customer_id;
    try {
        const newResponse = yield responsesModel_1.default.createResponse(ticketId, sender, response, images || null);
        res.status(201).json(newResponse);
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ msg: 'Error creating response.', error: errorMessage });
    }
});
exports.createResponse = createResponse;
const getResponsesByTicketId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ticketId } = req.params;
    try {
        const responses = yield responsesModel_1.default.getResponsesByTicketId(ticketId);
        res.status(200).json(responses);
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ msg: 'Error fetching responses.', error: errorMessage });
    }
});
exports.getResponsesByTicketId = getResponsesByTicketId;
const getLatestResponseTimestamp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ticketId } = req.params;
    try {
        const timestamp = yield responsesModel_1.default.getLatestResponseTimestamp(ticketId);
        res.status(200).json({ latestResponseTimestamp: timestamp });
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ msg: 'Error fetching latest response timestamp.', error: errorMessage });
    }
});
exports.getLatestResponseTimestamp = getLatestResponseTimestamp;
const countResponsesByTicketId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ticketId } = req.params;
    try {
        const count = yield responsesModel_1.default.countResponsesByTicketId(ticketId);
        res.status(200).json({ responseCount: count });
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ msg: 'Error counting responses.', error: errorMessage });
    }
});
exports.countResponsesByTicketId = countResponsesByTicketId;
