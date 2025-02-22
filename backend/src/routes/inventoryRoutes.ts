import express from 'express'
import { pool } from '../config/database'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

const router = express.Router()

// Get all inventory items
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM inventory ORDER BY id ASC')
    res.json(rows)
  } catch (error) {
    console.error('Error fetching inventory items:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory items',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get inventory item by ID
router.get('/:id', async (req, res) => {
  const inventoryItemId = req.params.id
  
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM inventory WHERE id = ?',
      [inventoryItemId]
    )
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Inventory item with ID ${inventoryItemId} not found`
      })
    }
    
    res.json({
      success: true,
      data: rows[0]
    })
  } catch (error) {
    console.error(`Error fetching inventory item ${inventoryItemId}:`, error)
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory item',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get inventory item transactions
router.get('/:id/transactions', async (req, res) => {
  const inventoryItemId = req.params.id
  
  try {
    // First, verify the inventory item exists
    const [inventoryCheck] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM inventory WHERE id = ?',
      [inventoryItemId]
    )
    
    if (inventoryCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Inventory item with ID ${inventoryItemId} not found`
      })
    }
    
    // Fetch transactions with supplier name
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        it.id,
        it.inventoryItemId,
        it.transactionType,
        it.quantity,
        it.date,
        it.reason,
        s.supplierName
      FROM inventory_transactions it
      LEFT JOIN suppliers s ON it.supplier_id = s.id
      WHERE it.inventoryItemId = ?
      ORDER BY it.date DESC`,
      [inventoryItemId]
    )
    
    res.json({
      success: true,
      data: rows
    })
  } catch (error) {
    console.error(`Error fetching transactions for inventory item ${inventoryItemId}:`, error)
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory transactions',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Create inventory item
router.post('/', async (req, res) => {
  const {
    itemName,
    description,
    currentStock,
    minimumStock,
    unit,
    category
  } = req.body

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO inventory (itemName, description, currentStock, minimumStock, unit, category) VALUES (?, ?, ?, ?, ?, ?)',
      [itemName, description, currentStock, minimumStock, unit, category]
    )

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: {
        id: result.insertId,
        itemName,
        description,
        currentStock,
        minimumStock,
        unit,
        category
      }
    })
  } catch (error) {
    console.error('Error creating inventory item:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating inventory item',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Update inventory item
router.put('/:id', async (req, res) => {
  const inventoryItemId = req.params.id
  const {
    itemName,
    description,
    currentStock,
    minimumStock,
    unit,
    category
  } = req.body

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE inventory SET itemName = ?, description = ?, currentStock = ?, minimumStock = ?, unit = ?, category = ? WHERE id = ?',
      [itemName, description, currentStock, minimumStock, unit, category, inventoryItemId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: `Inventory item with ID ${inventoryItemId} not found`
      })
    }

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: {
        id: parseInt(inventoryItemId),
        itemName,
        description,
        currentStock,
        minimumStock,
        unit,
        category
      }
    })
  } catch (error) {
    console.error(`Error updating inventory item ${inventoryItemId}:`, error)
    res.status(500).json({
      success: false,
      message: 'Error updating inventory item',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Create inventory transaction (Stock In/Out)
router.post('/transactions', async (req, res) => {
  const {
    inventoryItemId,
    supplierId,
    transactionType,
    quantity,
    reason
  } = req.body

  try {
    // Start a transaction
    await pool.query('START TRANSACTION')

    // Verify inventory item exists
    const [inventoryCheck] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM inventory WHERE id = ?',
      [inventoryItemId]
    )

    if (inventoryCheck.length === 0) {
      await pool.query('ROLLBACK')
      return res.status(404).json({
        success: false,
        message: `Inventory item with ID ${inventoryItemId} not found`
      })
    }

    // Verify supplier exists if provided for Stock In
    if (transactionType === 'Stock In' && supplierId) {
      const [supplierCheck] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM suppliers WHERE id = ?',
        [supplierId]
      )

      if (supplierCheck.length === 0) {
        await pool.query('ROLLBACK')
        return res.status(404).json({
          success: false,
          message: `Supplier with ID ${supplierId} not found`
        })
      }
    }

    // Insert transaction record with optional supplierId
    const [transactionResult] = await pool.query<ResultSetHeader>(
      'INSERT INTO inventory_transactions (inventoryItemId, transactionType, quantity, date, reason, supplier_id) VALUES (?, ?, ?, NOW(), ?, ?)',
      [inventoryItemId, transactionType, quantity, reason, supplierId || null]
    )

    // Update inventory stock
    const updateQuery = transactionType === 'Stock In' 
      ? 'UPDATE inventory SET currentStock = currentStock + ? WHERE id = ?' 
      : 'UPDATE inventory SET currentStock = currentStock - ? WHERE id = ?'

    const [stockUpdateResult] = await pool.query<ResultSetHeader>(
      updateQuery,
      [quantity, inventoryItemId]
    )

    // Commit the transaction
    await pool.query('COMMIT')

    // Log the transaction details for debugging
    console.log('Transaction Created:', {
      transactionId: transactionResult.insertId,
      inventoryItemId,
      supplierId,
      transactionType,
      quantity
    })

    res.status(201).json({
      success: true,
      message: 'Inventory transaction processed successfully',
      data: {
        transactionId: transactionResult.insertId,
        inventoryItemId,
        supplierId,
        transactionType,
        quantity
      }
    })
  } catch (error) {
    await pool.query('ROLLBACK')
    console.error('Error processing inventory transaction:', error)
    res.status(500).json({
      success: false,
      message: 'Error processing inventory transaction',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Delete inventory item
router.delete('/:id', async (req, res) => {
  const inventoryItemId = req.params.id

  try {
    // Check if the item has any existing transactions
    const [transactionCheck] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as transactionCount FROM inventory_transactions WHERE inventoryItemId = ?',
      [inventoryItemId]
    )

    if (transactionCheck[0].transactionCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete inventory item with existing transactions'
      })
    }

    // Proceed with deletion
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM inventory WHERE id = ?',
      [inventoryItemId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: `Inventory item with ID ${inventoryItemId} not found`
      })
    }

    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    })
  } catch (error) {
    console.error(`Error deleting inventory item ${inventoryItemId}:`, error)
    res.status(500).json({
      success: false,
      message: 'Error deleting inventory item',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router