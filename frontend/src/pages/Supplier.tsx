import React, { useState, useEffect } from 'react'
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, IconButton, Typography, FormControl, InputLabel, Select, MenuItem, Grid, Chip, Rating, Tooltip } from '@mui/material'
import { Edit as EditIcon, Add as AddIcon, Close as CloseIcon } from '@mui/icons-material'
import { supplierAPI } from '../services/api'

interface Supplier {
  id: number
  supplierName: string
  tin: string
  businessRegNo: string
  primaryContact: string
  primaryContactNumber: string
  secondaryContact: string
  secondaryContactNumber: string
  email: string
  alternativeEmail: string
  website: string
  address: string
  productCategories: string[]
  paymentTerms: string
  creditLimit: number
  leadTime: string
  status: 'Active' | 'Inactive'
  supplyRating: number
  qualityRating: number
  deliveryRating: number
  lastSupplyDate: string
  paymentMethod: string
}

const PRODUCT_CATEGORIES = [
  'Paper Supplies',
  'Ink Supplies',
  'Machinery Parts',
  'Printing Plates',
  'Chemicals',
  'Packaging Materials',
  'Other'
]

const PAYMENT_TERMS = [
  'Cash on Delivery',
  'GCash',
  'Cheque',
  'Net 45',
  'Net 60'
]

const PAYMENT_METHODS = [
  'Bank Transfer',
  'Check',
  'Cash',
  'Credit Card',
  'Digital Payment'
]

const DEFAULT_FORM_DATA: Supplier = {
  id: 0,
  supplierName: '',
  tin: '',
  businessRegNo: '',
  primaryContact: '',
  primaryContactNumber: '',
  secondaryContact: '',
  secondaryContactNumber: '',
  email: '',
  alternativeEmail: '',
  website: '',
  address: '',
  productCategories: [],
  paymentTerms: 'Cash on Delivery',
  creditLimit: 0,
  leadTime: '',
  status: 'Active',
  supplyRating: 0,
  qualityRating: 0,
  deliveryRating: 0,
  lastSupplyDate: '',
  paymentMethod: 'Bank Transfer'
}

const RATING_DESCRIPTIONS = {
  supply: 'Reliability and consistency of supply deliveries',
  quality: 'Quality of products and services provided',
  delivery: 'Timeliness and accuracy of deliveries'
}

export default function Supplier() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Supplier>(DEFAULT_FORM_DATA)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentSupplierId, setCurrentSupplierId] = useState<number | null>(null)

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const response = await supplierAPI.getAll()
      setSuppliers(Array.isArray(response.data.data) ? response.data.data : [])
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      setSuppliers([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isEditMode && currentSupplierId) {
        await supplierAPI.update(currentSupplierId, formData)
      } else {
        await supplierAPI.create(formData)
      }
      await fetchSuppliers()
      handleDialogClose()
    } catch (error) {
      console.error('Error saving supplier:', error)
    }
  }

  const handleDialogClose = () => {
    setFormData({ ...DEFAULT_FORM_DATA })
    setIsDialogOpen(false)
    setIsEditMode(false)
    setCurrentSupplierId(null)
  }

  const handleEdit = (supplier: Supplier) => {
    setFormData({
      ...DEFAULT_FORM_DATA,
      ...supplier,
      productCategories: supplier.productCategories || [],
      paymentTerms: supplier.paymentTerms || 'Cash on Delivery',
      paymentMethod: supplier.paymentMethod || 'Bank Transfer',
      status: supplier.status || 'Active'
    })
    setCurrentSupplierId(supplier.id)
    setIsEditMode(true)
    setIsDialogOpen(true)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4"><b>Supplier Management</b></Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsDialogOpen(true)}
          sx={{ bgcolor: '#3461B5' }}
        >
          Add Supplier
        </Button>
      </Box>

      {/* Suppliers Table */}
      <TableContainer component={Paper}>{/* Ensure no whitespace between tags */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Supplier Name</b></TableCell>
              <TableCell><b>Primary Contact Person</b></TableCell>
              <TableCell><b>Contact Number</b></TableCell>
              <TableCell><b>Email</b></TableCell>
              <TableCell><b>Product Categories</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell align="center"><b>Supply</b></TableCell>
              <TableCell align="center"><b>Quality</b></TableCell>
              <TableCell align="center"><b>Delivery</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(suppliers) && suppliers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>{supplier.id}</TableCell>
                  <TableCell>{supplier.supplierName}</TableCell>
                  <TableCell>{supplier.primaryContact}</TableCell>
                  <TableCell>{supplier.primaryContactNumber}</TableCell>
                  <TableCell>{supplier.email}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {(supplier.productCategories || []).map((category) => (
                        <Chip
                          key={category}
                          label={category}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={supplier.status}
                      color={supplier.status === 'Active' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={RATING_DESCRIPTIONS.supply} arrow>
                      <Box>
                        <Rating value={supplier.supplyRating} readOnly size="small" max={5} />
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={RATING_DESCRIPTIONS.quality} arrow>
                      <Box>
                        <Rating value={supplier.qualityRating} readOnly size="small" max={5} />
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={RATING_DESCRIPTIONS.delivery} arrow>
                      <Box>
                        <Rating value={supplier.deliveryRating} readOnly size="small" max={5} />
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(supplier)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={suppliers.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10))
            setPage(0)
          }}
        />
      </TableContainer>

      {/* Add/Edit Supplier Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onClose={handleDialogClose} 
        maxWidth="md" 
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ m: 0, p: 2, pr: 6 }}>
            {isEditMode ? 'Edit Supplier' : 'Add New Supplier'}
            <IconButton
              aria-label="close"
              onClick={handleDialogClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500]
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Basic Information</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Supplier Name"
                  name="supplierName"
                  value={formData.supplierName}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplierName: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="TIN"
                  name="tin"
                  value={formData.tin}
                  onChange={(e) => setFormData(prev => ({ ...prev, tin: e.target.value }))}
                  fullWidth
                />
              </Grid>

              {/* Contact Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2, mt: 2 }}>Contact Information</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Primary Contact Person"
                  name="primaryContact"
                  value={formData.primaryContact}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryContact: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Primary Contact Number"
                  name="primaryContactNumber"
                  value={formData.primaryContactNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryContactNumber: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Secondary Contact Person"
                  name="secondaryContact"
                  value={formData.secondaryContact}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondaryContact: e.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Secondary Contact Number"
                  name="secondaryContactNumber"
                  value={formData.secondaryContactNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondaryContactNumber: e.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Alternative Email"
                  name="alternativeEmail"
                  type="email"
                  value={formData.alternativeEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, alternativeEmail: e.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Website"
                  name="website"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  fullWidth
                  required
                  multiline
                  rows={2}
                />
              </Grid>

              {/* Business Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2, mt: 2 }}>Business Information</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Product Categories</InputLabel>
                  <Select
                    multiple
                    value={formData.productCategories || []}
                    label="Product Categories"
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      productCategories: Array.isArray(e.target.value) ? e.target.value : []
                    }))}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                      )}
                      >
                        {PRODUCT_CATEGORIES.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Payment Terms</InputLabel>
                      <Select
                        value={formData.paymentTerms || 'Cash on Delivery'}
                        label="Payment Terms"
                        onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                      >
                        {PAYMENT_TERMS.map((term) => (
                          <MenuItem key={term} value={term}>
                            {term}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Credit Limit"
                      name="creditLimit"
                      type="number"
                      value={formData.creditLimit}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        creditLimit: Number(e.target.value) 
                      }))}
                      fullWidth
                      inputProps={{ min: 0 }}
                      InputProps={{
                        startAdornment: (
                          <Typography sx={{ mr: 1 }}>₱</Typography>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Tooltip title="Average time in days for order delivery" arrow>
                      <TextField
                        label="Lead Time (Days)"
                        name="leadTime"
                        type="number"
                        value={formData.leadTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, leadTime: e.target.value }))}
                        fullWidth
                        inputProps={{ min: 0 }}
                      />
                    </Tooltip>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Payment Method</InputLabel>
                      <Select
                        value={formData.paymentMethod || 'Bank Transfer'}
                        label="Payment Method"
                        onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      >
                        {PAYMENT_METHODS.map((method) => (
                          <MenuItem key={method} value={method}>
                            {method}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.status || 'Active'}
                        label="Status"
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          status: e.target.value as 'Active' | 'Inactive'
                        }))}
                      >
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
    
                  {/* Performance Ratings */}
                  {isEditMode && (
                    <>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mb: 2, mt: 2 }}>Performance Ratings</Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Tooltip title={RATING_DESCRIPTIONS.supply} arrow>
                            <Typography component="legend">Supply Rating</Typography>
                          </Tooltip>
                          <Rating
                            name="supplyRating"
                            value={formData.supplyRating}
                            onChange={(_, newValue) => setFormData(prev => ({
                              ...prev,
                              supplyRating: newValue || 0
                            }))}
                            max={5}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Tooltip title={RATING_DESCRIPTIONS.quality} arrow>
                            <Typography component="legend">Quality Rating</Typography>
                          </Tooltip>
                          <Rating
                            name="qualityRating"
                            value={formData.qualityRating}
                            onChange={(_, newValue) => setFormData(prev => ({
                              ...prev,
                              qualityRating: newValue || 0
                            }))}
                            max={5}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Tooltip title={RATING_DESCRIPTIONS.delivery} arrow>
                            <Typography component="legend">Delivery Rating</Typography>
                          </Tooltip>
                          <Rating
                            name="deliveryRating"
                            value={formData.deliveryRating}
                            onChange={(_, newValue) => setFormData(prev => ({
                              ...prev,
                              deliveryRating: newValue || 0
                            }))}
                            max={5}
                          />
                        </Box>
                      </Grid>
                    </>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions>
              <Button onClick={(e) => (e.preventDefault(), handleDialogClose())}>Cancel</Button>
              <Button type="submit" variant="contained" sx={{ bgcolor: '#3461B5' }}>{isEditMode ? "Update" : "Add"}</Button>
              </DialogActions>
            </form>
          </Dialog>
        </Box>
      )
    }