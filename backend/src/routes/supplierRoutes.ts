import express from 'express'
import { pool } from '../config/database'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

const router = express.Router()

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM suppliers ORDER BY id DESC')
    res.json({
      success: true,
      data: rows
    })
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching suppliers',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get supplier by ID
router.get('/:id', async (req, res) => {
  const supplierId = req.params.id
  
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM suppliers WHERE id = ?',
      [supplierId]
    )
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Supplier with ID ${supplierId} not found`
      })
    }
    
    res.json({
      success: true,
      data: rows[0]
    })
  } catch (error) {
    console.error(`Error fetching supplier ${supplierId}:`, error)
    res.status(500).json({
      success: false,
      message: 'Error fetching supplier',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Create supplier
router.post('/', async (req, res) => {
  const {
    supplierName,
    tin,
    businessRegNo,
    primaryContact,
    primaryContactNumber,
    secondaryContact,
    secondaryContactNumber,
    email,
    alternativeEmail,
    website,
    address,
    productCategories,
    paymentTerms,
    creditLimit,
    leadTime,
    status,
    paymentMethod
  } = req.body

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO suppliers (
        supplierName, tin, businessRegNo, primaryContact, primaryContactNumber,
        secondaryContact, secondaryContactNumber, email, alternativeEmail,
        website, address, productCategories, paymentTerms, creditLimit,
        leadTime, status, paymentMethod
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        supplierName,
        tin,
        businessRegNo,
        primaryContact,
        primaryContactNumber,
        secondaryContact,
        secondaryContactNumber,
        email,
        alternativeEmail,
        website,
        address,
        JSON.stringify(productCategories),
        paymentTerms,
        creditLimit,
        leadTime,
        status,
        paymentMethod
      ]
    )

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: {
        id: result.insertId,
        ...req.body
      }
    })
  } catch (error) {
    console.error('Error creating supplier:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating supplier',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Update supplier
router.put('/:id', async (req, res) => {
  const supplierId = req.params.id
  const {
    supplierName,
    tin,
    businessRegNo,
    primaryContact,
    primaryContactNumber,
    secondaryContact,
    secondaryContactNumber,
    email,
    alternativeEmail,
    website,
    address,
    productCategories,
    paymentTerms,
    creditLimit,
    leadTime,
    status,
    supplyRating,
    qualityRating,
    deliveryRating,
    paymentMethod
  } = req.body

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE suppliers SET 
        supplierName = ?, tin = ?, businessRegNo = ?, primaryContact = ?,
        primaryContactNumber = ?, secondaryContact = ?, secondaryContactNumber = ?,
        email = ?, alternativeEmail = ?, website = ?, address = ?,
        productCategories = ?, paymentTerms = ?, creditLimit = ?, leadTime = ?,
        status = ?, supplyRating = ?, qualityRating = ?, deliveryRating = ?,
        paymentMethod = ?
      WHERE id = ?`,
      [
        supplierName,
        tin,
        businessRegNo,
        primaryContact,
        primaryContactNumber,
        secondaryContact,
        secondaryContactNumber,
        email,
        alternativeEmail,
        website,
        address,
        JSON.stringify(productCategories),
        paymentTerms,
        creditLimit,
        leadTime,
        status,
        supplyRating,
        qualityRating,
        deliveryRating,
        paymentMethod,
        supplierId
      ]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: `Supplier with ID ${supplierId} not found`
      })
    }

    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: {
        id: parseInt(supplierId),
        ...req.body
      }
    })
  } catch (error) {
    console.error(`Error updating supplier ${supplierId}:`, error)
    res.status(500).json({
      success: false,
      message: 'Error updating supplier',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router