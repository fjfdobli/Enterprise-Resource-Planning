"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// GET all transactions
router.get('/', (req, res) => {
    res.json({ message: 'Get all transactions' });
});
// GET single transaction
router.get('/:id', (req, res) => {
    res.json({ message: `Get transaction ${req.params.id}` });
});
// GET transactions by client ID
router.get('/client/:clientId', (req, res) => {
    res.json({ message: `Get transactions for client ${req.params.clientId}` });
});
// POST new transaction
router.post('/', (req, res) => {
    res.json({ message: 'Create new transaction' });
});
// PUT update transaction
router.put('/:id', (req, res) => {
    res.json({ message: `Update transaction ${req.params.id}` });
});
// DELETE transaction
router.delete('/:id', (req, res) => {
    res.json({ message: `Delete transaction ${req.params.id}` });
});
exports.default = router;
