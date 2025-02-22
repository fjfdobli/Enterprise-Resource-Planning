"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const clientRoutes_1 = __importDefault(require("./routes/clientRoutes"));
const transactionRoutes_1 = __importDefault(require("./routes/transactionRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 3000;
// CORS configuration
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173', // Your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api/clients', clientRoutes_1.default);
app.use('/api/transactions', transactionRoutes_1.default);
// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Opzon ERP API' });
});
// Start server
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
