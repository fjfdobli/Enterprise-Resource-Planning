import express from 'express'
import { pool } from '../config/database'
import { RowDataPacket } from 'mysql2/promise'

const router = express.Router()

router.get('/morning/:date', async (req, res) => {
    try {
        const date = req.params.date
        console.log('Fetching morning attendance for date:', date)
        console.log('Request parameters:', {
            date,
            type: typeof date
        })

        const [rows] = await pool.query(
            `SELECT m.*, e.firstName, e.lastName 
             FROM morningAttendance m 
             LEFT JOIN employeeList e ON m.employeeId = e.employeeId 
             WHERE DATE(m.date) = ?`,
            [date]
        )
        
        console.log('Morning attendance query result:', {
            rowCount: (rows as RowDataPacket[]).length,
            rows
        })

        res.json({ 
            success: true, 
            data: rows 
        })
    } catch (error) {
        console.error('DETAILED Error fetching morning attendance:', error)
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})

// Get afternoon attendance for a specific date
router.get('/afternoon/:date', async (req, res) => {
    try {
        const date = req.params.date
        console.log('Fetching afternoon attendance for date:', date)

        // Enhanced logging for debugging
        console.log('Request parameters:', {
            date,
            type: typeof date
        })

        const [rows] = await pool.query(
            `SELECT a.*, e.firstName, e.lastName 
             FROM afternoonAttendance a 
             LEFT JOIN employeeList e ON a.employeeId = e.employeeId 
             WHERE a.date = ?`,
            [date]
        )
        
        console.log('Afternoon attendance query result:', {
            rowCount: (rows as RowDataPacket[]).length,
            rows
        })

        res.json({ 
            success: true, 
            data: rows 
        })
    } catch (error) {
        console.error('DETAILED Error fetching afternoon attendance:', error)
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})

// Record morning attendance
router.post('/morning', async (req, res) => {
    console.log('Received POST request to /morning')
    console.log('Request body:', req.body)
    console.log('Request headers:', req.headers)

    try {
        const { employeeId, date, timeIn, timeOut, status } = req.body
        
        // Validate required fields
        if (!employeeId || !date || !timeIn || !timeOut || !status) {
            console.log('Missing required fields:', { employeeId, date, timeIn, timeOut, status })
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            })
        }

        // Log the data being processed
        console.log('Processing morning attendance:', {
            employeeId,
            date,
            timeIn,
            timeOut,
            status,
            employeeIdType: typeof employeeId,
            dateType: typeof date
        })

        // Check if employee exists
        const [employeeCheck] = await pool.query(
            'SELECT * FROM employeeList WHERE employeeId = ?',
            [employeeId]
        )

        console.log('Employee check result:', {
            found: (employeeCheck as RowDataPacket[]).length > 0,
            employeeData: employeeCheck
        })

        if ((employeeCheck as RowDataPacket[]).length === 0) {
            console.log(`Employee not found: ${employeeId}`)
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            })
        }

        // Check if attendance already exists
        const [existing] = await pool.query(
            'SELECT * FROM morningAttendance WHERE employeeId = ? AND date = ?',
            [employeeId, date]
        )

        console.log('Existing attendance check:', {
            exists: (existing as RowDataPacket[]).length > 0,
            existingData: existing
        })

        let result
        if ((existing as RowDataPacket[]).length > 0) {
            console.log('Updating existing attendance')
            result = await pool.query(
                'UPDATE morningAttendance SET timeIn = ?, timeOut = ?, status = ? WHERE employeeId = ? AND date = ?',
                [timeIn, timeOut, status, employeeId, date]
            )
        } else {
            // Create new attendance record
            console.log('Creating new attendance record')
            result = await pool.query(
                'INSERT INTO morningAttendance (employeeId, date, timeIn, timeOut, status) VALUES (?, ?, ?, ?, ?)',
                [employeeId, date, timeIn, timeOut, status]
            )
        }

        console.log('Database operation result:', result)
        
        res.status(201).json({ 
            success: true, 
            message: 'Morning attendance recorded successfully',
            data: { employeeId, date, timeIn, timeOut, status }
        })
    } catch (error) {
        console.error('Detailed error recording morning attendance:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        })
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})

// Record afternoon attendance
router.post('/afternoon', async (req, res) => {
    console.log('Received POST request to /afternoon')
    console.log('Request body:', req.body)
    console.log('Request headers:', req.headers)

    try {
        const { employeeId, date, timeIn, timeOut, status } = req.body
        
        // Validate required fields
        if (!employeeId || !date || !timeIn || !timeOut || !status) {
            console.log('Missing required fields:', { employeeId, date, timeIn, timeOut, status })
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            })
        }

        // Log the data being processed
        console.log('Processing afternoon attendance:', {
            employeeId,
            date,
            timeIn,
            timeOut,
            status,
            employeeIdType: typeof employeeId,
            dateType: typeof date
        })

        // Check if employee exists
        const [employeeCheck] = await pool.query(
            'SELECT * FROM employeeList WHERE employeeId = ?',
            [employeeId]
        )

        console.log('Employee check result:', {
            found: (employeeCheck as RowDataPacket[]).length > 0,
            employeeData: employeeCheck
        })

        if ((employeeCheck as RowDataPacket[]).length === 0) {
            console.log(`Employee not found: ${employeeId}`)
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            })
        }

        // Check if attendance already exists
        const [existing] = await pool.query(
            'SELECT * FROM afternoonAttendance WHERE employeeId = ? AND date = ?',
            [employeeId, date]
        )

        console.log('Existing attendance check:', {
            exists: (existing as RowDataPacket[]).length > 0,
            existingData: existing
        })

        let result
        if ((existing as RowDataPacket[]).length > 0) {
            console.log('Updating existing attendance')
            result = await pool.query(
                'UPDATE afternoonAttendance SET timeIn = ?, timeOut = ?, status = ? WHERE employeeId = ? AND date = ?',
                [timeIn, timeOut, status, employeeId, date]
            )
        } else {
            console.log('Creating new attendance record')
            result = await pool.query(
                'INSERT INTO afternoonAttendance (employeeId, date, timeIn, timeOut, status) VALUES (?, ?, ?, ?, ?)',
                [employeeId, date, timeIn, timeOut, status]
            )
        }

        console.log('Database operation result:', result)
        
        res.status(201).json({ 
            success: true, 
            message: 'Afternoon attendance recorded successfully',
            data: { employeeId, date, timeIn, timeOut, status }
        })
    } catch (error) {
        console.error('Detailed error recording afternoon attendance:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        })
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})

// Get attendance report
router.get('/report', async (req, res) => {
    try {
        const { startDate, endDate } = req.query
        console.log('Fetching attendance report:', { startDate, endDate })

        // Validate dates
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            })
        }

        // Get morning attendance
        const [morningRows] = await pool.query(
            `SELECT m.*, e.firstName, e.lastName 
             FROM morningAttendance m 
             LEFT JOIN employeeList e ON m.employeeId = e.employeeId 
             WHERE m.date BETWEEN ? AND ?`,
            [startDate, endDate]
        )

        // Get afternoon attendance
        const [afternoonRows] = await pool.query(
            `SELECT a.*, e.firstName, e.lastName 
             FROM afternoonAttendance a 
             LEFT JOIN employeeList e ON a.employeeId = e.employeeId 
             WHERE a.date BETWEEN ? AND ?`,
            [startDate, endDate]
        )

        console.log('Report query results:', {
            morningCount: (morningRows as RowDataPacket[]).length,
            afternoonCount: (afternoonRows as RowDataPacket[]).length
        })

        res.json({
            success: true,
            data: {
                morning: morningRows,
                afternoon: afternoonRows
            }
        })
    } catch (error) {
        console.error('Error generating attendance report:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})

export default router