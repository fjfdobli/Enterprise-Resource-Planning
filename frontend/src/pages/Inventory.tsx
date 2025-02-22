import React, { useState, useEffect } from 'react'
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, IconButton, MenuItem, Select, FormControl, InputLabel,Typography,Chip,Tooltip } from '@mui/material'
import { Edit as EditIcon, Add as AddIcon,ShoppingBasket as BasketIcon,Close as CloseIcon } from '@mui/icons-material'
import { inventoryAPI, supplierAPI } from '../services/api'

interface InventoryItem {
  id: number
  itemName: string
  description: string
  currentStock: number
  minimumStock: number
  unit: string
  category: string
}

interface Supplier {
  id: number
  supplierName: string
}

interface InventoryTransaction {
  id: number
  inventoryItemId: number
  supplierId: number | null
  supplierName: string | null
  transactionType: 'Stock In' | 'Stock Out'
  quantity: number
  date: string
  reason: string
}

const UNIT_OPTIONS = [
  'Sheet',
  'Ream',
  'Roll',
  'Piece',
  'Liter',
  'Kg',
  'Box',
  'Pack'
]

const CATEGORY_OPTIONS = [
  'Raw Materials', 
  'Finished Goods', 
  'Supplies', 
  'Equipment'
]

const DEFAULT_FORM_DATA = {
  itemName: '',
  description: '',
  currentStock: '',
  minimumStock: '',
  unit: '',
  category: ''
}

export default function Inventory() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  
  // Item Dialog States
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false)
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentItemId, setCurrentItemId] = useState<number | null>(null)

  // Transaction Dialog States
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] = useState(false)
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null)
  const [selectedItemTransactions, setSelectedItemTransactions] = useState<InventoryTransaction[]>([])
  
  // Stock Transaction States
  const [transactionType, setTransactionType] = useState<'Stock In' | 'Stock Out'>('Stock In')
  const [supplierId, setSupplierId] = useState<string>('')
  const [quantity, setQuantity] = useState<string>('')
  const [reason, setReason] = useState<string>('')

  useEffect(() => {
    fetchInventoryItems()
    fetchSuppliers()
  }, [])

  const fetchInventoryItems = async () => {
    try {
      const response = await inventoryAPI.getAll()
      setInventoryItems(response.data)
    } catch (error) {
      console.error('Error fetching inventory items:', error)
      alert('Failed to fetch inventory items')
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await supplierAPI.getAll()
      console.log('Full supplier response:', response)
      
      const supplierData = response.data?.data || response.data || []
      
      setSuppliers(supplierData)
      
      if (supplierData.length === 0) {
        console.warn('No suppliers found')
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      setSuppliers([])
      alert('Failed to load suppliers. Please check your connection.')
    }
  }

  const fetchItemTransactions = async (itemId: number) => {
    try {
      console.log(`Attempting to fetch transactions for item ID: ${itemId}`)
      const response = await inventoryAPI.getTransactions(itemId)
      
      console.log('Transactions fetched successfully:', response)
      
      setSelectedItemTransactions(response.data || [])
      setIsTransactionHistoryOpen(true)
    } catch (error: unknown) {
      const err = error as { message: string; response?: { data?: { message?: string; status?: number } } }
      console.error('Detailed Error fetching item transactions:', {
        message: err.message,
        response: err.response?.data,
      })
  
      alert(`Failed to fetch transactions: ${err.response?.data?.message || err.message}`)
    }
  }

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const itemData = {
        ...formData,
        currentStock: parseInt(formData.currentStock),
        minimumStock: parseInt(formData.minimumStock)
      }

      if (isEditMode && currentItemId) {
        await inventoryAPI.update(currentItemId, itemData)
      } else {
        await inventoryAPI.create(itemData)
      }
      
      fetchInventoryItems()
      handleItemDialogClose()
    } catch (error) {
      console.error('Error saving inventory item:', error)
      alert('Failed to save inventory item')
    }
  }

  const handleStockTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Validate required fields
      if (!currentItemId) {
        alert('No inventory item selected')
        return
      }

      if (!quantity || parseInt(quantity) <= 0) {
        alert('Please enter a valid quantity')
        return
      }

      // Additional validation for Stock In transactions
      if (transactionType === 'Stock In' && !supplierId) {
        alert('Supplier is required for Stock In transactions')
        return
      }

      const transactionData = {
        inventoryItemId: currentItemId,
        supplierId: transactionType === 'Stock In' 
          ? (supplierId ? parseInt(supplierId) : null) 
          : null,
        transactionType,
        quantity: parseInt(quantity),
        reason
      }

      console.log('Transaction Data:', transactionData)

      const response = await inventoryAPI.createTransaction(transactionData)
      console.log('Transaction Response:', response)
      
      fetchInventoryItems()
      handleTransactionDialogClose()
    } catch (error: unknown) {
      console.error('Error processing stock transaction:', error)
      const err = error as { message: string }
      alert(`Transaction failed: ${err.message}`)
    }
  }

  const handleItemDialogClose = () => {
    setIsItemDialogOpen(false)
    setFormData(DEFAULT_FORM_DATA)
    setIsEditMode(false)
    setCurrentItemId(null)
  }

  const handleTransactionDialogClose = () => {
    setIsTransactionDialogOpen(false)
    setTransactionType('Stock In')
    setSupplierId('')
    setQuantity('')
    setReason('')
    setCurrentItemId(null)
  }

  const handleEditItem = (item: InventoryItem) => {
    setFormData({
      itemName: item.itemName,
      description: item.description,
      currentStock: item.currentStock.toString(),
      minimumStock: item.minimumStock.toString(),
      unit: item.unit,
      category: item.category
    })
    setCurrentItemId(item.id)
    setIsEditMode(true)
    setIsItemDialogOpen(true)
  }

  const handleOpenStockTransaction = (item: InventoryItem) => {
    setCurrentItemId(item.id)
    setIsTransactionDialogOpen(true)
    // Reset supplier for new transaction
    setSupplierId('')
  }

  const handleItemRowClick = (item: InventoryItem) => {
    setSelectedInventoryItem(item)
    fetchItemTransactions(item.id)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4"><b>Inventory Management</b></Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setIsItemDialogOpen(true)}
          sx={{ bgcolor: '#3461B5' }}
        >
          Add Inventory Item
        </Button>
      </Box>

      {/* Inventory Items Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Item Name</b></TableCell>
              <TableCell><b>Description</b></TableCell>
              <TableCell><b>Category</b></TableCell>
              <TableCell align="right"><b>Current Stock</b></TableCell>
              <TableCell align="right"><b>Minimum Stock</b></TableCell>
              <TableCell align="right"><b>Unit</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventoryItems.map((item) => (
              <TableRow 
                key={item.id} 
                hover 
                onClick={() => handleItemRowClick(item)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.itemName}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell align="right">{item.currentStock}</TableCell>
                <TableCell align="right">{item.minimumStock}</TableCell>
                <TableCell align="right">{item.unit}</TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Tooltip title="Stock Transaction" arrow>
                      <IconButton 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenStockTransaction(item)
                        }}
                      >
                        <BasketIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Item" arrow>
                      <IconButton 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditItem(item)
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={inventoryItems.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10))
            setPage(0)
          }}
        />
      </TableContainer>

      {/* Add/Edit Inventory Item Dialog */}
      <Dialog open={isItemDialogOpen} onClose={handleItemDialogClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleItemSubmit}>
          <DialogTitle>
            {isEditMode ? 'Edit Inventory Item' : 'Add New Inventory Item'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                label="Item Name"
                name="itemName"
                value={formData.itemName}
                onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
                fullWidth
                required
              />
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                fullWidth
                multiline
                rows={2}
                required
              />
              <TextField
                label="Current Stock"
                name="currentStock"
                type="number"
                value={formData.currentStock}
                onChange={(e) => setFormData(prev => ({ ...prev, currentStock: e.target.value }))}
                fullWidth
                required
              />
              <TextField
                label="Minimum Stock"
                name="minimumStock"
                type="number"
                value={formData.minimumStock}
                onChange={(e) => setFormData(prev => ({ ...prev, minimumStock: e.target.value }))}
                fullWidth
                required
              />
              <FormControl fullWidth required>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={formData.unit}
                  label="Unit"
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                >
                  {UNIT_OPTIONS.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                >
                  {CATEGORY_OPTIONS.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleItemDialogClose}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#3461B5' }}>
              {isEditMode ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Stock Transaction Dialog */}
      <Dialog open={isTransactionDialogOpen} onClose={handleTransactionDialogClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleStockTransaction}>
          <DialogTitle>Stock Transaction</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant={transactionType === 'Stock In' ? 'contained' : 'outlined'}
                color="success"
                onClick={() => setTransactionType('Stock In')}
                fullWidth
              >
                Stock In
              </Button>
              <Button
                variant={transactionType === 'Stock Out' ? 'contained' : 'outlined'}
                color="error"
                onClick={() => setTransactionType('Stock Out')}
                fullWidth
              >
                Stock Out
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {transactionType === 'Stock In' && (
                <FormControl fullWidth required>
                  <InputLabel>Supplier</InputLabel>
                  <Select
                    value={supplierId}
                    label="Supplier"
                    onChange={(e) => {
                      console.log('Selected Supplier:', e.target.value)
                      setSupplierId(e.target.value as string)
                    }}
                    error={transactionType === 'Stock In' && !supplierId}
                  >
                    {suppliers.length === 0 ? (
                      <MenuItem disabled>No suppliers available</MenuItem>
                    ) : (
                      suppliers.map((supplier) => (
                        <MenuItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.supplierName}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {transactionType === 'Stock In' && !supplierId && (
                    <Typography color="error" variant="caption">
                      Supplier is required for Stock In transactions
                    </Typography>
                  )}
                </FormControl>
              )}
              <TextField
                label="Quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                fullWidth
                multiline
                rows={2}
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleTransactionDialogClose}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              color={transactionType === 'Stock In' ? 'success' : 'error'}
            >
              {transactionType === 'Stock In' ? 'Add Stock' : 'Remove Stock'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Transaction History Dialog */}
      <Dialog 
        open={isTransactionHistoryOpen} 
        onClose={() => setIsTransactionHistoryOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2, pr: 6, position: 'relative' }}>
        <b>Transaction History for {selectedInventoryItem?.itemName}
          <IconButton
            aria-label="close"
            onClick={() => setIsTransactionHistoryOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500]
            }}
          >
            <CloseIcon />
          </IconButton>
          </b></DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>Date</b></TableCell>
                  <TableCell><b>Type</b></TableCell>
                  <TableCell><b>Quantity</b></TableCell>
                  <TableCell><b>Supplier</b></TableCell>
                  <TableCell><b>Reason</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedItemTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.transactionType}
                        color={transaction.transactionType === 'Stock In' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{transaction.quantity}</TableCell>
                    <TableCell>
                      {transaction.supplierName || 'N/A'}
                    </TableCell>
                    <TableCell>{transaction.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </Box>
  )
}