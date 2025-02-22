import express from 'express'
import { pool } from '../config/database'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

const router = express.Router()

// Get all orders
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY id ASC')
    res.json(rows)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    })
  }
})

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.id]
    )
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }
    res.json({
      success: true,
      data: rows[0]
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching order'
    })
  }
})

// Create order
router.post('/', async (req, res) => {
  const {
    clientId,
    orderDate,
    status,
    orderName,
    orderId,
    description,
    quantity,
    pricePerUnit,
    totalPrice
  } = req.body

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO orders (clientId, orderDate, status, orderName, orderId, description, quantity, pricePerUnit, totalPrice) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [clientId, orderDate, status, orderName, orderId, description, quantity, pricePerUnit, totalPrice]
    )
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        id: result.insertId,
        clientId,
        orderDate,
        status,
        orderName,
        orderId,
        description,
        quantity,
        pricePerUnit,
        totalPrice
      }
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating order'
    })
  }
})

// Update order
router.put('/:id', async (req, res) => {
  const {
    clientId,
    orderDate,
    status,
    orderName,
    orderId,
    description,
    quantity,
    pricePerUnit,
    totalPrice
  } = req.body

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE orders SET clientId = ?, orderDate = ?, status = ?, orderName = ?, orderId = ?, description = ?, quantity = ?, pricePerUnit = ?, totalPrice = ? WHERE id = ?',
      [clientId, orderDate, status, orderName, orderId, description, quantity, pricePerUnit, totalPrice, req.params.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: {
        id: parseInt(req.params.id),
        clientId,
        orderDate,
        status,
        orderName,
        orderId,
        description,
        quantity,
        pricePerUnit,
        totalPrice
      }
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating order'
    })
  }
})

// Get orders by client ID
router.get('/client/:clientId', async (req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM orders WHERE clientId = ? ORDER BY orderDate DESC',
      [req.params.clientId]
    )
    res.json({
      success: true,
      data: rows
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching client orders'
    })
  }
})

export default router