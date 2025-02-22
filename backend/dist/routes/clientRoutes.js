"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// GET all clients
router.get('/', (req, res) => {
    res.json({ message: 'Get all clients' });
});
// GET single client
router.get('/:id', (req, res) => {
    res.json({ message: `Get client ${req.params.id}` });
});
// POST new client
router.post('/', (req, res) => {
    res.json({ message: 'Create new client' });
});
// PUT update client
router.put('/:id', (req, res) => {
    res.json({ message: `Update client ${req.params.id}` });
});
// DELETE client
router.delete('/:id', (req, res) => {
    res.json({ message: `Delete client ${req.params.id}` });
});
exports.default = router;
