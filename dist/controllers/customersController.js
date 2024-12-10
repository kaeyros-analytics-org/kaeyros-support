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
exports.deleteCustomer = exports.updateCustomer = exports.getCustomerById = exports.getAllCustomers = exports.loginCustomer = exports.createCustomer = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const customersModel_1 = __importDefault(require("../models/customersModel"));
const createCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, phone_number, project, country, city, image, password, role } = req.body;
    if (!name || !email || !phone_number || !project || !password) {
        res.status(400).json({ msg: 'Please fill all required fields.' });
        return; // Ensure you return after sending a response
    }
    const existingCustomer = yield customersModel_1.default.getCustomerByEmail(email);
    if (existingCustomer) {
        res.status(400).json({ msg: 'Email already exists.' });
        return; // Ensure you return after sending a response
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    const newCustomer = yield customersModel_1.default.createCustomer({
        name,
        email,
        phone_number,
        project,
        country,
        city,
        image,
        password: hashedPassword,
        role: role || 'user',
    });
    res.status(201).json(newCustomer);
});
exports.createCustomer = createCustomer;
//   } catch (err) {
//     const errorMessage = err instanceof Error ? err.message : 'Unknown error';
//     res.status(500).json({ msg: 'Error creating customer.', error: errorMessage });
//   }
// };
const loginCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const customer = yield customersModel_1.default.getCustomerByEmail(email);
    if (!customer) {
        res.status(404).json({ msg: 'Customer not found.' });
        return; // Ensure you return after sending a response
    }
    const isMatch = yield bcrypt_1.default.compare(password, customer.password);
    if (!isMatch) {
        res.status(400).json({ msg: 'Invalid credentials.' });
        return; // Ensure you return after sending a response
    }
    const token = jsonwebtoken_1.default.sign({ id: customer.id, role: customer.role }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
    res.status(200).json({ token, customer: { id: customer.id, email: customer.email, role: customer.role } });
});
exports.loginCustomer = loginCustomer;
const getAllCustomers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customers = yield customersModel_1.default.getAllCustomers();
        res.status(200).json(customers);
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ msg: 'Error fetching customers.', error: errorMessage });
        return;
    }
});
exports.getAllCustomers = getAllCustomers;
const getCustomerById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const customer = yield customersModel_1.default.getCustomerById(id);
        if (!customer) {
            res.status(404).json({ msg: 'Customer not found.' });
            return; // Ensuring void return
        }
        res.status(200).json(customer); // Send response here
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ msg: 'Error retrieving customer.', error: errorMessage });
    }
});
exports.getCustomerById = getCustomerById;
const updateCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updates = req.body;
    try {
        const updatedCustomer = yield customersModel_1.default.updateCustomer(id, updates);
        if (!updatedCustomer) {
            res.status(404).json({ msg: 'Customer not found' });
            return; // Ensuring void return
        }
        res.status(200).json(updatedCustomer); // Send response here
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ msg: 'Error updating customer.', error: errorMessage });
    }
});
exports.updateCustomer = updateCustomer;
const deleteCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deleted = yield customersModel_1.default.deleteCustomer(id);
        if (!deleted) {
            res.status(404).json({ msg: 'Customer not found.' });
            return; // Ensuring void return
        }
        res.status(200).json({ msg: 'Customer deleted successfully.' }); // Send response here
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ msg: 'Error deleting customer.', error: errorMessage });
    }
});
exports.deleteCustomer = deleteCustomer;
