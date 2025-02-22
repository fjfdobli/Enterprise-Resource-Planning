import React, { useState, useEffect } from 'react'
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, TablePagination, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, MenuItem, Tabs, Tab } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import { useNavigate } from 'react-router-dom'
import { employeeAPI } from '../services/api'

interface Employee {
  id: number
  employeeId: string
  firstName: string
  middleInitial: string
  lastName: string
  email: string
  contactNumber: string
  position: string
  department: string
  dateHired: string
  status: 'Active' | 'Inactive'
}

interface EmployeeFormData {
  firstName: string
  middleInitial: string
  lastName: string
  email: string
  contactNumber: string
  position: string
  department: string
  dateHired: string
  status: 'Active' | 'Inactive'
}

const initialEmployeeForm: EmployeeFormData = {
  firstName: '',
  middleInitial: '',
  lastName: '',
  email: '',
  contactNumber: '',
  position: '',
  department: '',
  dateHired: new Date().toISOString().split('T')[0],
  status: 'Active'
}

const getStatusStyle = (status: string) => ({
  backgroundColor: status === 'Active' ? '#4CAF50' : '#F44336',
  color: 'white',
  padding: '4px 12px',
  borderRadius: '16px',
  display: 'inline-block'
})

const Employee = () => {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [employeeForm, setEmployeeForm] = useState<EmployeeFormData>(initialEmployeeForm)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [tabValue, setTabValue] = useState('All')
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue)
    if (newValue === 'All') {
      navigate('/attendance')
    } else if (newValue === 'Completed') {
      navigate('/attendance/afternoon')
    } else {
      navigate('/attendance/morning')
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAll()
      if (response.data.success) {
        setEmployees(response.data.data || [])
      } else {
        showSnackbar('Failed to fetch employees', 'error')
      }
    } catch (error) {
      showSnackbar('Error connecting to server', 'error')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEmployeeForm(prev => ({
      ...prev,
      [name]: name === 'middleInitial' ? value.charAt(0).toUpperCase() : value
    }))
  }

  const handleAddNew = () => {
    setDialogMode('add')
    setSelectedId(null)
    setEmployeeForm(initialEmployeeForm)
    setOpenDialog(true)
  }

  const handleEdit = (employee: Employee) => {
    setDialogMode('edit')
    setSelectedId(employee.id)
    setEmployeeForm({
      firstName: employee.firstName,
      middleInitial: employee.middleInitial,
      lastName: employee.lastName,
      email: employee.email,
      contactNumber: employee.contactNumber,
      position: employee.position,
      department: employee.department,
      dateHired: employee.dateHired,
      status: employee.status
    })
    setOpenDialog(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = dialogMode === 'add' 
        ? await employeeAPI.create(employeeForm)
        : await employeeAPI.update(selectedId!, employeeForm)

      if (response.data.success) {
        showSnackbar(
          `Successfully ${dialogMode === 'add' ? 'added' : 'updated'} employee`,
          'success'
        )
        handleCloseDialog()
        fetchEmployees()
      } else {
        showSnackbar(response.data.message || 'Operation failed', 'error')
      }
    } catch (error) {
      showSnackbar('Error saving employee', 'error')
    }
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEmployeeForm(initialEmployeeForm)
    setSelectedId(null)
  }

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Employee Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage employee information and attendance
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label={<b>Employee List</b>} value="All" />
        <Tab label={<b>Morning Attendance</b>} value="Pending" />
        <Tab label={<b>Afternoon Attendance</b>} value="Completed" />
      </Tabs>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" onClick={handleAddNew}>
          Add New Employee
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Employee ID</b></TableCell>
              <TableCell><b>Name</b></TableCell>
              <TableCell><b>Email</b></TableCell>
              <TableCell><b>Contact</b></TableCell>
              <TableCell><b>Position</b></TableCell>
              <TableCell><b>Department</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.employeeId}</TableCell>
                  <TableCell>
                    {`${employee.firstName} ${employee.middleInitial} ${employee.lastName}`}
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.contactNumber}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>
                    <span style={getStatusStyle(employee.status)}>
                      {employee.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleEdit(employee)}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={employees.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10))
          setPage(0)
        }}
      />

      {/* Employee Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {dialogMode === 'add' ? 'Add New Employee' : 'Edit Employee'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  name="firstName"
                  label="First Name"
                  value={employeeForm.firstName}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  name="middleInitial"
                  label="M.I."
                  value={employeeForm.middleInitial}
                  onChange={handleInputChange}
                  fullWidth
                  inputProps={{ maxLength: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  name="lastName"
                  label="Last Name"
                  value={employeeForm.lastName}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  value={employeeForm.email}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="contactNumber"
                  label="Contact Number"
                  value={employeeForm.contactNumber}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="position"
                  label="Position"
                  value={employeeForm.position}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  name="department"
                  label="Department"
                  value={employeeForm.department}
                  onChange={handleInputChange}
                  fullWidth
                  required
                >
                  {['IT', 'HR', 'Finance', 'Operations', 'Sales', 'Marketing'].map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="dateHired"
                  label="Date Hired"
                  type="date"
                  value={employeeForm.dateHired}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  name="status"
                  label="Status"
                  value={employeeForm.status}
                  onChange={handleInputChange}
                  fullWidth
                  required
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {dialogMode === 'add' ? 'Add' : 'Save Changes'}
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

export default Employee