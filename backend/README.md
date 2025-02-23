# 🚀 ERP System Backend

A robust backend service built with Node.js and Express.js for the Enterprise Resource Planning system.

## 🛠️ Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MySQL** - Database 
- **JWT** - Authentication
- **Cors** - Cross-Origin Resource Sharing
- **Dotenv** - Environment variables management

## 📁 Project Structure

```
backend/
├── dist/              
├── routes/            
│   ├── clientRoutes.js
│   ├── transactionRoutes.js
│   └── app.js
├── node_modules/      
├── src/              
│   ├── config/       
│   │   └── database.ts
│   ├── controllers/  
│   ├── middleware/   
│   ├── routes/       
│   │   ├── attendanceRoutes.ts
│   │   ├── clientRoutes.ts
│   │   ├── employeeRoutes.ts
│   │   ├── inventoryRoutes.ts
│   │   ├── orderRoutes.ts
│   │   └── supplierRoutes.ts
│   └── types/        
│       └── inventory.ts
├── app.ts            
├── .env              
├── package-lock.json 
├── package.json     
└── tsconfig.json    
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Database (MySQL/PostgreSQL)

### Installation

1. Install dependencies
```bash
npm install
```

2. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the development server
```bash
npm run dev
# Server will start on http://localhost:3000
```

## 📡 API Endpoints

### Client Management
```
GET     /api/clients          # Get all clients
POST    /api/clients          # Create new client
GET     /api/clients/:id      # Get client by ID
PUT     /api/clients/:id      # Update client
DELETE  /api/clients/:id      # Delete client
```

### Order Management
```
GET     /api/orders           # Get all orders
POST    /api/orders           # Create new order
GET     /api/orders/:id       # Get order by ID
PUT     /api/orders/:id       # Update order
DELETE  /api/orders/:id       # Delete order
```

### Inventory Management
```
GET     /api/inventory        # Get all inventory
POST    /api/inventory        # Add inventory item
PUT     /api/inventory/:id    # Update inventory item
DELETE  /api/inventory/:id    # Delete inventory item
```

### Supplier Management
```
GET     /api/suppliers        # Get all suppliers
POST    /api/suppliers        # Add supplier
PUT     /api/suppliers/:id    # Update supplier
DELETE  /api/suppliers/:id    # Delete supplier
```

### Employee/Attendance Management
```
GET     /api/employees        # Get all employees
POST    /api/employees        # Add employee
GET     /api/attendance       # Get attendance records
POST    /api/attendance       # Record attendance
```

### Machine Management
```
GET     /api/machines        # Get all machines
POST    /api/machines        # Add machine
PUT     /api/machines/:id    # Update machine status
DELETE  /api/machines/:id    # Delete machine
```

### Payroll Management
```
GET     /api/payroll         # Get payroll records
POST    /api/payroll         # Process payroll
GET     /api/payroll/:id     # Get specific payroll
```

### Reports
```
GET     /api/reports/sales        # Get sales reports
GET     /api/reports/inventory    # Get inventory reports
GET     /api/reports/employees    # Get employee reports
GET     /api/reports/machines     # Get machine reports
```

## 📦 Available Scripts

```bash
# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🔒 Environment Variables

```env
PORT=3000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
# Add other environment variables
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Notes

- The server runs on port 3000 by default
- API documentation is available at `/api-docs` when running in development mode
- All API endpoints are prefixed with `/api`
- Authentication is required for most endpoints

## 🐛 Debugging

To run the server in debug mode:
```bash
npm run debug
```

Then attach your debugger to port 9229.

---

<div align="center">
Made with ❤️ for System Integration & Architecture 2
</div>