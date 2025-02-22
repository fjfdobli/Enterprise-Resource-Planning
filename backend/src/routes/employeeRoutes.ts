import express from 'express'
import { pool } from '../config/database'
import { RowDataPacket, ResultSetHeader } from 'mysql2'
const router = express.Router()

// Get all employees
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM employeeList ORDER BY id DESC`)
    res.json({ success: true, data: rows })
  } catch (error) {
    console.error('Error fetching employees:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Create new employee
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      middleInitial,
      lastName,
      email,
      contactNumber,
      position,
      department,
      dateHired,
      status = 'Active'
    } = req.body

    // Check if email already exists
    const [existingEmail] = await pool.query(
      'SELECT id FROM employeeList WHERE email = ?',
      [email]
    )

    if ((existingEmail as RowDataPacket[]).length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      })
    }

    // Get the latest employeeId to generate the next one
    const [lastEmployee] = await pool.query<RowDataPacket[]>(
      'SELECT employeeId FROM employeeList ORDER BY id DESC LIMIT 1'
    )

    // Generate new employeeId
    let newEmployeeId
    if ((lastEmployee as RowDataPacket[]).length > 0) {
      const lastNumber = parseInt(lastEmployee[0].employeeId.replace('EMP', ''))
      newEmployeeId = `EMP${String(lastNumber + 1).padStart(3, '0')}`
    } else {
      newEmployeeId = 'EMP001'
    }

    const [result] = await pool.query(
      `INSERT INTO employeeList ( employeeId, firstName, middleInitial, lastName, email, contactNumber, position, department,
        dateHired, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newEmployeeId,
        firstName,
        middleInitial,
        lastName,
        email,
        contactNumber,
        position,
        department,
        dateHired,
        status
      ]
    )

    const insertId = (result as ResultSetHeader).insertId
    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: { 
        id: insertId,
        employeeId: newEmployeeId
      }
    })
  } catch (error) {
    console.error('Error creating employee:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    })
  }
})

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const {
      firstName,
      middleInitial,
      lastName,
      email,
      contactNumber,
      position,
      department,
      dateHired,
      status
    } = req.body

    // Check if email already exists for other employees
    const [existingEmail] = await pool.query(
      'SELECT id FROM employeeList WHERE email = ? AND id != ?',
      [email, req.params.id]
    )

    if ((existingEmail as RowDataPacket[]).length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      })
    }

    const [result] = await pool.query(
      `UPDATE employeeList SET firstName = ?, middleInitial = ?, lastName = ?, email = ?, contactNumber = ?, position = ?,
           department = ?,
           dateHired = ?,
           status = ?
       WHERE id = ?`,
      [
        firstName,
        middleInitial,
        lastName,
        email,
        contactNumber,
        position,
        department,
        dateHired,
        status,
        req.params.id
      ]
    )

    if ((result as ResultSetHeader).affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Employee not found' })
    }

    res.json({
      success: true,
      message: 'Employee updated successfully'
    })
  } catch (error) {
    console.error('Error updating employee:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM employeeList WHERE id = ?',
      [req.params.id]
    )

    if ((rows as RowDataPacket[]).length === 0) {
      return res.status(404).json({ success: false, error: 'Employee not found' })
    }

    res.json({ success: true, data: (rows as RowDataPacket[])[0] })
  } catch (error) {
    console.error('Error fetching employee:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router