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
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../Database/db"));
const secret = process.env.JWT_SECRET || 'your_jwt_secret';
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).json({ msg: 'Unauthorized access. Token missing.' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = { id: decoded.id, role: decoded.role };
        // Verify the user still exists in the database
        const [results] = yield db_1.default.query('SELECT role FROM customers WHERE id = ?', [req.user.id]);
        if (results.length > 0) {
            req.user.role = results[0].role;
            next(); // Proceed to the next middleware
        }
        else {
            res.status(404).json({ error: 'User not found.' });
        }
    }
    catch (err) {
        res.status(401).json({ msg: 'Invalid or expired token.', error: err instanceof Error ? err.message : 'Unknown error' });
    }
});
exports.authenticate = authenticate;
// Authorize function remains unchanged
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ msg: 'Access denied.' });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
