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
class CustomersModel {
    static getCustomerByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield db_1.default.query('SELECT * FROM customers WHERE email = ?', [email]);
            return rows[0];
        });
    }
    static createCustomer(customer) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield db_1.default.query('INSERT INTO customers SET ?', customer);
            return Object.assign({ id: result.insertId }, customer);
        });
    }
    static getAllCustomers() {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield db_1.default.query('SELECT id, name, email, phone_number, project, country, city, ticket_count FROM customers');
            return rows;
        });
    }
    static getCustomerById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield db_1.default.query('SELECT id, name, email, phone_number, project, country, city, ticket_count FROM customers WHERE id = ?', [id]);
            return rows[0];
        });
    }
    static updateCustomer(id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield db_1.default.query('UPDATE customers SET ? WHERE id = ?', [updates, id]);
            return result.affectedRows ? Object.assign({ id }, updates) : null;
        });
    }
    static deleteCustomer(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield db_1.default.query('DELETE FROM customers WHERE id = ?', [id]);
            return result.affectedRows > 0;
        });
    }
}
exports.default = CustomersModel;
