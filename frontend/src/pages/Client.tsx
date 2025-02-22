import { useState, useEffect } from 'react'
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, IconButton, Modal,Typography } from '@mui/material'
import { Edit as EditIcon } from '@mui/icons-material'
import CloseIcon from '@mui/icons-material/Close'
import { clientAPI } from '../services/api'

interface Client {
  id: number
  clientName: string
  businessName: string
  email: string
  contactNo: string
  businessAddress: string
}

interface Order {
  id: number
  orderDate: string
  status: string
  orderName: string
  orderId: string
  description: string
  quantity: number | string
  pricePerUnit: number | string
  totalPrice: number | string
}

const defaultFormData = {
  clientName: '',
  businessName: '',
  email: '',
  contactNo: '',
  businessAddress: ''
}

export default function Client() {
  const [clients, setClients] = useState<Client[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState(defaultFormData)
  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  
  // New state for order history
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [orderHistory, setOrderHistory] = useState<Order[]>([])
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await clientAPI.getAll()
      setClients(response.data)
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const fetchClientOrders = async (clientId: number) => {
    try {
      const response = await clientAPI.getClientOrders(clientId)
      const processedOrders = response.data.map((order: Order) => ({
        ...order,
        quantity: Number(order.quantity || 0),
        pricePerUnit: Number(order.pricePerUnit || 0),
        totalPrice: Number(order.totalPrice || 0)
      }))
      setOrderHistory(processedOrders)
      setIsOrderHistoryOpen(true)
    } catch (error) {
      console.error('Error fetching client orders:', error)
    }
  }

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleOpen = () => {
    setFormData(defaultFormData)
    setIsEdit(false)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setFormData(defaultFormData)
    setIsEdit(false)
    setEditId(null)
  }

  const handleEdit = (client: Client) => {
    setFormData({
      clientName: client.clientName,
      businessName: client.businessName,
      email: client.email,
      contactNo: client.contactNo,
      businessAddress: client.businessAddress
    })
    setEditId(client.id)
    setIsEdit(true)
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isEdit && editId) {
        await clientAPI.update(editId, formData)
      } else {
        await clientAPI.create(formData)
      }
      fetchClients()
      handleClose()
    } catch (error) {
      console.error('Error saving client:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleClientRowClick = (client: Client) => {
    fetchClientOrders(client.id)
    setSelectedClient(client)
  }

  const handleCloseOrderHistory = () => {
    setIsOrderHistoryOpen(false)
    setSelectedClient(null)
    setOrderHistory([])
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <h1>Client Profile</h1>
        <Button 
          variant="contained" 
          onClick={handleOpen}
          sx={{ bgcolor: '#3461B5' }}
        >
          ADD NEW CLIENT
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Client Name</b></TableCell>
              <TableCell><b>Business Name</b></TableCell>
              <TableCell><b>Email</b></TableCell>
              <TableCell><b>Contact No</b></TableCell>
              <TableCell><b>Business Address</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? clients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : clients
            ).map((client) => (
              <TableRow 
                key={client.id} 
                hover 
                onClick={() => handleClientRowClick(client)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{client.id}</TableCell>
                <TableCell>{client.clientName}</TableCell>
                <TableCell>{client.businessName}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.contactNo}</TableCell>
                <TableCell>{client.businessAddress}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={(e) => {
                    e.stopPropagation()
                    handleEdit(client)
                  }}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={clients.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{isEdit ? 'Edit Client' : 'Add New Client'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                label="Client Name"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                label="Business Name"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                label="Contact No"
                name="contactNo"
                value={formData.contactNo}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                label="Business Address"
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleChange}
                fullWidth
                required
                multiline
                rows={2}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#3461B5' }}>
              {isEdit ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Order History Modal */}
      <Modal
        open={isOrderHistoryOpen}
        onClose={handleCloseOrderHistory}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box 
          sx={{
            width: '80%',
            maxHeight: '80%',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            overflow: 'auto'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2
          }}>
            <Typography variant="h6" fontWeight="bold">
              Order History for {selectedClient?.clientName}
            </Typography>
            <IconButton onClick={handleCloseOrderHistory}>
              <CloseIcon />
            </IconButton>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>ID</b></TableCell>
                  <TableCell><b>Order Date</b></TableCell>
                  <TableCell><b>Status</b></TableCell>
                  <TableCell><b>Order Name</b></TableCell>
                  <TableCell><b>Order ID</b></TableCell>
                  <TableCell><b>Description</b></TableCell>
                  <TableCell align="right"><b>Quantity</b></TableCell>
                  <TableCell align="right"><b>Price Per Unit</b></TableCell>
                  <TableCell align="right"><b>Total Price</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderHistory.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>{order.orderName}</TableCell>
                    <TableCell>{order.orderId}</TableCell>
                    <TableCell>{order.description}</TableCell>
                    <TableCell align="right">{Number(order.quantity)}</TableCell>
                    <TableCell align="right">₱{Number(order.pricePerUnit).toFixed(2)}</TableCell>
                    <TableCell align="right">₱{Number(order.totalPrice).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Modal>
    </Box>
  )
}