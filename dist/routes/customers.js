"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customersController_1 = require("../controllers/customersController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/register', customersController_1.createCustomer);
router.post('/login', customersController_1.loginCustomer);
router.get('/all', auth_1.authenticate, (0, auth_1.authorize)(['admin']), customersController_1.getAllCustomers);
router.get('/:id', auth_1.authenticate, customersController_1.getCustomerById);
router.patch('/:id', auth_1.authenticate, customersController_1.updateCustomer);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(['admin']), customersController_1.deleteCustomer);
exports.default = router;
