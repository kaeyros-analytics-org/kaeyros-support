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
const promise_1 = __importDefault(require("mysql2/promise"));
const pool = promise_1.default.createPool({
    host: 'localhost',
    user: 'root',
    database: 'new_support_ticketing2',
    password: 'new_password',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
function connectToDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield pool.getConnection();
            console.log('Successfully connected to MySQL database');
        }
        catch (error) {
            console.error('Error connecting to the database:', error);
            process.exit(1);
        }
    });
}
connectToDatabase();
exports.default = pool;
