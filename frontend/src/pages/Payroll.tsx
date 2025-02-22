import React, { useState, useEffect } from 'react'
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, MenuItem } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useNavigate } from 'react-router-dom'

interface PayrollRecord {
  id: number
  employeeId: string
  firstName: string
  lastName: string
  payPeriodStart: string
  payPeriodEnd: string
  basicPay: number
  overtime: number
  deductions: number
  netPay: number
  status: 'Pending' | 'Processed' | 'Paid'
}

interface PayrollFormData {
  employeeId: string
  payPeriodStart: string
  payPeriodEnd: string
  basicPay: number
  overtime: number
  deductions: number
  netPay: number
  status: 'Pending' | 'Processed' | 'Paid'
}

const initialPayrollForm: PayrollFormData = {
  employeeId: '',
  payPeriodStart: new Date().toISOString().split('T')[0],
  payPeriodEnd: new Date().toISOString().split('T')[0],
  basicPay: 0,
  overtime: 0,
  deductions: 0,
  netPay: 0,
  status: 'Pending'
}

const getStatusStyle = (status: string) => {
  if (status === 'Pending') {
    return { backgroundColor: '#FFC107', color: 'black', padding: '4px 12px', borderRadius: '16px', display: 'inline-block' }
  } else if (status === 'Processed') {
    return { backgroundColor: '#2196F3', color: 'white', padding: '4px 12px', borderRadius: '16px', display: 'inline-block' }
  } else if (status === 'Paid') {
    return { backgroundColor: '#4CAF50', color: 'white', padding: '4px 12px', borderRadius: '16px', display: 'inline-block' }
  } else {
    return {}
  }
}

const Payroll = () => {
  const navigate = useNavigate()
  const [payroll, setPayroll] = useState<PayrollRecord[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [payrollForm, setPayrollForm] = useState<PayrollFormData>(initialPayrollForm)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  useEffect(() => {
    fetchPayroll()
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      // Replace with your actual API call
      const response = await fetch('/api/employees')
      const data = await response.json()
      setEmployees(data || [])
    } catch (error) {
      showSnackbar('Error fetching employees', 'error')
    }
  }

  const fetchPayroll = async () => {
    try {
      // Replace with your actual API call
      const response = await fetch('/api/payroll')
      const data = await response.json()
      setPayroll(data || [])
    } catch (error) {
      showSnackbar('Error fetching payroll data', 'error')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPayrollForm(prev => ({
      ...prev,
      [name]: value,
      netPay: name === 'basicPay' || name === 'overtime' || name === 'deductions'
        ? calculateNetPay({
            ...prev,
            [name]: parseFloat(value) || 0
          })
        : prev.netPay
    }))
  }

  const calculateNetPay = (form: PayrollFormData): number => {
    return form.basicPay + form.overtime - form.deductions
  }

  const handleAddNew = () => {
    setDialogMode('add')
    setSelectedId(null)
    setPayrollForm(initialPayrollForm)
    setOpenDialog(true)
  }

  const handleEdit = (record: PayrollRecord) => {
    setDialogMode('edit')
    setSelectedId(record.id)
    setPayrollForm({
      employeeId: record.employeeId,
      payPeriodStart: record.payPeriodStart,
      payPeriodEnd: record.payPeriodEnd,
      basicPay: record.basicPay,
      overtime: record.overtime,
      deductions: record.deductions,
      netPay: record.netPay,
      status: record.status
    })
    setOpenDialog(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this payroll record?')) {
      try {
        // Replace with your actual API call
        await fetch(`/api/payroll/${id}`, { method: 'DELETE' })
        showSnackbar('Payroll record deleted successfully', 'success')
        fetchPayroll()
      } catch (error) {
        showSnackbar('Error deleting payroll record', 'error')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Replace with your actual API call
      const response = await fetch('/api/payroll', {
        method: dialogMode === 'add' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dialogMode === 'add' ? payrollForm : { ...payrollForm, id: selectedId })
      })

      if (response.ok) {
        showSnackbar(
          `Successfully ${dialogMode === 'add' ? 'added' : 'updated'} payroll record`,
          'success'
        )
        handleCloseDialog()
        fetchPayroll()
      } else {
        showSnackbar('Operation failed', 'error')
      }
    } catch (error) {
      showSnackbar('Error saving payroll record', 'error')
    }
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setPayrollForm(initialPayrollForm)
    setSelectedId(null)
  }

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Payroll Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage employee payroll records and process payments
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" onClick={handleAddNew}>
          Create Payroll Record
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Employee ID</b></TableCell>
              <TableCell><b>Employee</b></TableCell>
              <TableCell><b>Pay Period</b></TableCell>
              <TableCell><b>Basic Pay</b></TableCell>
              <TableCell><b>Overtime</b></TableCell>
              <TableCell><b>Deductions</b></TableCell>
              <TableCell><b>Net Pay</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payroll.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  {record.firstName} {record.lastName} ({record.employeeId})
                </TableCell>
                <TableCell>
                  {new Date(record.payPeriodStart).toLocaleDateString()} - {new Date(record.payPeriodEnd).toLocaleDateString()}
                </TableCell>
                <TableCell>${record.basicPay.toFixed(2)}</TableCell>
                <TableCell>${record.overtime.toFixed(2)}</TableCell>
                <TableCell>${record.deductions.toFixed(2)}</TableCell>
                <TableCell>${record.netPay.toFixed(2)}</TableCell>
                <TableCell>
                  <span style={getStatusStyle(record.status)}>
                    {record.status}
                  </span>
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEdit(record)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(record.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {dialogMode === 'add' ? 'Create Payroll Record' : 'Edit Payroll Record'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  name="employeeId"
                  label="Employee"
                  value={payrollForm.employeeId}
                  onChange={handleInputChange}
                  fullWidth
                  required
                >
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.employeeId}>
                      {emp.firstName} {emp.lastName} ({emp.employeeId})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  name="status"
                  label="Status"
                  value={payrollForm.status}
                  onChange={handleInputChange}
                  fullWidth
                  required
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Processed">Processed</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="payPeriodStart"
                  label="Pay Period Start"
                  type="date"
                  value={payrollForm.payPeriodStart}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="payPeriodEnd"
                  label="Pay Period End"
                  type="date"
                  value={payrollForm.payPeriodEnd}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="basicPay"
                  label="Basic Pay"
                  type="number"
                  value={payrollForm.basicPay}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: <span>₱</span>
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="overtime"
                  label="Overtime Pay"
                  type="number"
                  value={payrollForm.overtime}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: <span>₱</span>
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="deductions"
                  label="Deductions"
                  type="number"
                  value={payrollForm.deductions}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: <span>₱</span>
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Net Pay"
                  value={`$${payrollForm.netPay.toFixed(2)}`}
                  fullWidth
                  disabled
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {dialogMode === 'add' ? 'Create' : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Payroll