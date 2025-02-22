import express, { Request, Response, NextFunction } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import clientRoutes from './routes/clientRoutes'
import orderRoutes from './routes/orderRoutes'
import inventoryRoutes from './routes/inventoryRoutes'
import supplierRoutes from './routes/supplierRoutes'
import employeeRoutes from './routes/employeeRoutes'
import attendanceRoutes from './routes/attendanceRoutes'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// Cors configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}))

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/clients', clientRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/suppliers', supplierRoutes)
app.use('/api/employee', employeeRoutes)
app.use('/api/attendance', attendanceRoutes)

// Welcome route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to Opzon ERP API' })
})

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.stack)
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// Handle 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
})

export default app