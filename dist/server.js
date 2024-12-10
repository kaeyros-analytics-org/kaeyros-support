"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
const tickets_1 = __importDefault(require("./routes/tickets"));
const customers_1 = __importDefault(require("./routes/customers"));
const responses_1 = __importDefault(require("./routes/responses"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8000;
// Middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api/tickets', tickets_1.default);
app.use('/api/customers', customers_1.default);
app.use('/api/responses', responses_1.default);
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
