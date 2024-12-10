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
class ResponsesModel {
    static createResponse(ticketId, sender, response, images) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield db_1.default.query('INSERT INTO responses SET ?', { ticketId, sender, response, images });
            return { id: result.insertId, ticketId, sender, response, images };
        });
    }
    static getResponsesByTicketId(ticketId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield db_1.default.query('SELECT * FROM responses WHERE ticketId = ?', [ticketId]);
            return rows;
        });
    }
    static getLatestResponseTimestamp(ticketId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield db_1.default.query('SELECT MAX(created_at) AS latest FROM responses WHERE ticketId = ?', [ticketId]);
            return rows[0].latest;
        });
    }
    static countResponsesByTicketId(ticketId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield db_1.default.query('SELECT COUNT(*) AS count FROM responses WHERE ticketId = ?', [ticketId]);
            return rows[0].count;
        });
    }
}
exports.default = ResponsesModel;
