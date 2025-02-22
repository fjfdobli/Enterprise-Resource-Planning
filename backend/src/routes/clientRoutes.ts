import express from 'express'
import { pool } from '../config/database'
import { RowDataPacket } from 'mysql2'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM clients')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clients', error })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM clients WHERE id = ?',
      [req.params.id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Client not found' })
    }
    res.json(rows[0])
  } catch (error) {
    res.status(500).json({ message: 'Error fetching client', error })
  }
})

// New route to get client's order history
router.get('/:id/orders', async (req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM orders WHERE clientId = ? ORDER BY orderDate DESC',
      [req.params.id]
    )
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching client orders', error })
  }
})

router.post('/', async (req, res) => {
  const { clientName, businessAddress, contactNo, email, businessName } = req.body
  try {
    const [result] = await pool.query(
      'INSERT INTO clients (clientName, businessAddress, contactNo, email, businessName) VALUES (?, ?, ?, ?, ?)',
      [clientName, businessAddress, contactNo, email, businessName]
    )
    res.status(201).json({
      id: (result as any).insertId,
      clientName,
      businessAddress,
      contactNo,
      email,
      businessName
    })
  } catch (error) {
    res.status(500).json({ message: 'Error creating client', error })
  }
})

router.put('/:id', async (req, res) => {
  const { clientName, businessAddress, contactNo, email, businessName } = req.body
  try {
    await pool.query(
      'UPDATE clients SET clientName = ?, businessAddress = ?, contactNo = ?, email = ?, businessName = ? WHERE id = ?',
      [clientName, businessAddress, contactNo, email, businessName, req.params.id]
    )
    res.json({
      id: parseInt(req.params.id),
      clientName,
      businessAddress,
      contactNo,
      email,
      businessName
    })
  } catch (error) {
    res.status(500).json({ message: 'Error updating client', error })
  }
})

export default router