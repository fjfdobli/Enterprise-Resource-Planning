import { useState, useEffect } from 'react'
import {  Box,  Button,  Dialog,  DialogTitle,  DialogContent,  DialogActions,  TextField,  Paper,  Table,  TableBody,  TableCell,  TableContainer,  TableHead,  TableRow,  TablePagination,  IconButton,   MenuItem,  Select,  FormControl,  InputLabel, Tabs, Tab } from '@mui/material'
import { Edit as EditIcon } from '@mui/icons-material'
import { orderAPI, clientAPI } from '../services/api'
import { useCallback } from 'react'


interface Client {
  id: number
  clientName: string
}

interface Order {
  id: number
  clientId: number
  orderDate: string
  status: string
  orderName: string
  orderId: string
  description: string
  quantity: number
  pricePerUnit: number
  totalPrice: number
  client?: Client
}

const defaultFormData = {
  clientId: '',
  orderDate: '',
  status: 'Pending',
  orderName: '',
  orderId: '',
  description: '',
  quantity: '',
  pricePerUnit: '',
}

const statusOptions = ['Pending', 'Completed']

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState(defaultFormData)
  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Completed'>('All')

  const filterOrders = useCallback(() => {
    if (statusFilter === 'All') {
      setFilteredOrders(orders)
    } else {
      setFilteredOrders(
        orders.filter(order => order.status === statusFilter)
      )
    }
  }, [orders, statusFilter])

  useEffect(() => {
    fetchOrders()
    fetchClients()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, statusFilter])

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAll()
      const processedOrders = response.data.map((order: Order) => ({
        ...order,
        quantity: Number(order.quantity),
        pricePerUnit: Number(order.pricePerUnit),
        totalPrice: Number(order.totalPrice)
      }))
      setOrders(processedOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }


  const fetchClients = async () => {
    try {
      const response = await clientAPI.getAll()
      setClients(response.data)
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleStatusFilterChange = (_: React.SyntheticEvent, newValue: 'All' | 'Pending' | 'Completed') => {
    setStatusFilter(newValue)
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

  const handleEdit = (order: Order) => {
    if (statusFilter !== 'All') return

    setFormData({
      clientId: order.clientId.toString(),
      orderDate: order.orderDate.split('T')[0],
      status: order.status,
      orderName: order.orderName,
      orderId: order.orderId,
      description: order.description,
      quantity: order.quantity.toString(),
      pricePerUnit: order.pricePerUnit.toString(),
    })
    setEditId(order.id)
    setIsEdit(true)
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const orderData = {
        ...formData,
        clientId: parseInt(formData.clientId),
        quantity: parseInt(formData.quantity),
        pricePerUnit: parseFloat(formData.pricePerUnit),
        totalPrice: parseInt(formData.quantity) * parseFloat(formData.pricePerUnit)
      }

      if (isEdit && editId) {
        await orderAPI.update(editId, orderData)
      } else {
        await orderAPI.create(orderData)
      }
      fetchOrders()
      handleClose()
    } catch (error) {
      console.error('Error saving order:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name as string]: value
    }))
  }

  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId)
    return client?.clientName || ''
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <h1><b>Total Orders</b></h1>
        {statusFilter === 'All' && (
          <Button variant="contained" onClick={handleOpen} sx={{ bgcolor: '#3461B5' }}>
            Add New Order
          </Button>
        )}
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={statusFilter} 
          onChange={handleStatusFilterChange}
          aria-label="order status tabs"
        >
          <Tab label={<b>All Orders</b>} value="All" />
          <Tab label={<b>Pending Orders</b>} value="Pending" />
          <Tab label={<b>Completed Orders</b>} value="Completed" />
        </Tabs>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Customer Name</b></TableCell>
              <TableCell><b>Order Date</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Order Name</b></TableCell>
              <TableCell><b>Order ID</b></TableCell>
              <TableCell><b>Description</b></TableCell>
              <TableCell align="right"><b>Quantity</b></TableCell>
              <TableCell align="right"><b>Price Per Unit</b></TableCell>
              <TableCell align="right"><b>Total Price</b></TableCell>
              {statusFilter === 'All' && <TableCell align="right"><b>Actions</b></TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : filteredOrders
            ).map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{getClientName(order.clientId)}</TableCell>
                <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      bgcolor: order.status === 'Completed' ? '#DFF2BF' : '#FEEFB3',
                      color: order.status === 'Completed' ? '#4F8A10' : '#9F6000',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      display: 'inline-block'
                    }}
                  >
                    {order.status}
                  </Box>
                </TableCell>
                <TableCell>{order.orderName}</TableCell>
                <TableCell>{order.orderId}</TableCell>
                <TableCell>{order.description}</TableCell>
                <TableCell align="right">{order.quantity}</TableCell>
                <TableCell align="right">₱{Number(order.pricePerUnit).toFixed(2)}</TableCell>
                <TableCell align="right">₱{Number(order.totalPrice).toFixed(2)}</TableCell>
                {statusFilter === 'All' && (
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(order)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredOrders.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{isEdit ? 'Edit Order' : 'Add New Order'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>Client</InputLabel>
                <Select name="clientId" value={formData.clientId} onChange={handleChange} label="Client">
                  {clients.map(client => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.clientName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Order Date"
                name="orderDate"
                type="date"
                value={formData.orderDate}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />

              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select name="status" value={formData.status} onChange={handleChange} label="Status">
                  {statusOptions.map(status => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Order Name"
                name="orderName"
                value={formData.orderName}
                onChange={handleChange}
                fullWidth
                required
              />

              <TextField
                label="Order ID"
                name="orderId"
                value={formData.orderId}
                onChange={handleChange}
                fullWidth
                required
              />

              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                required
                multiline
                rows={2}
              />

              <TextField
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                fullWidth
                required
              />

              <TextField
                label="Price Per Unit"
                name="pricePerUnit"
                type="number"
                value={formData.pricePerUnit}
                onChange={handleChange}
                fullWidth
                required
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
    </Box>
  )
}
