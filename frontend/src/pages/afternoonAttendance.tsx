import React, { useState, useEffect } from 'react'
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, MenuItem, Tabs, Tab } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import { useNavigate } from 'react-router-dom'
import { attendanceAPI, employeeAPI } from '../services/api'

interface AttendanceRecord {
  id: number
  employeeId: string
  date: string
  timeIn: string | null
  timeOut: string | null
  status: 'Present' | 'Late' | 'Absent' | 'Sick Leave' | 'Vacation Leave' | 'Excused'
  firstName?: string
  lastName?: string
}

interface AttendanceFormData {
  employeeId: string
  date: string
  timeIn: string
  timeOut: string
  status: 'Present' | 'Late' | 'Absent' | 'Sick Leave' | 'Vacation Leave' | 'Excused'
}

const initialAttendanceForm: AttendanceFormData = {
  employeeId: '',
  date: new Date().toISOString().split('T')[0],
  timeIn: '1:00 PM',
  timeOut: '6:00 PM',
  status: 'Present'
}

const getStatusStyle = (status: string) => {
  if (status === 'Present') {
    return { backgroundColor: '#4CAF50', color: 'white', padding: '4px 12px', borderRadius: '16px', display: 'inline-block' }
  } else if (status === 'Late') {
    return { backgroundColor: '#FF9800', color: 'white', padding: '4px 12px', borderRadius: '16px', display: 'inline-block' }
  } else if (status === 'Absent') {
    return { backgroundColor: '#F44336', color: 'white', padding: '4px 12px', borderRadius: '16px', display: 'inline-block' }
  } else if (status === 'Sick Leave') {
    return { backgroundColor: '#FF5722', color: 'white', padding: '4px 12px', borderRadius: '16px', display: 'inline-block' }
  } else if (status === 'Vacation Leave') {
    return { backgroundColor: '#2196F3', color: 'white', padding: '4px 12px', borderRadius: '16px', display: 'inline-block' }
  } else if (status === 'Excused') {
    return { backgroundColor: '#FFC107', color: 'black', padding: '4px 12px', borderRadius: '16px', display: 'inline-block' }
  } else {
    return {}
  }
}

const convertTo12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(':')
  let hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  hour = hour % 12
  hour = hour ? hour : 12
  return `${hour}:${minutes} ${ampm}`
}

const convertTo24Hour = (time12: string): string => {
  const [time, period] = time12.split(' ')
  let [hours, minutes] = time.split(':')
  let hour = parseInt(hours)
  
  if (period === 'PM' && hour !== 12) {
    hour += 12
  } else if (period === 'AM' && hour === 12) {
    hour = 0
  }
  
  return `${hour.toString().padStart(2, '0')}:${minutes}`
}

const AfternoonAttendance = () => {
  const navigate = useNavigate()
  const [tabValue, setTabValue] = useState('Completed')
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [attendanceForm, setAttendanceForm] = useState<AttendanceFormData>(initialAttendanceForm)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  useEffect(() => {
    fetchAttendance()
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAll()
      if (response.data.success) {
        setEmployees(response.data.data || [])
      }
    } catch (error) {
      showSnackbar('Error fetching employees', 'error')
    }
  }

  const fetchAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await attendanceAPI.getAfternoonAttendance(today)
      if (response.data.success) {
        const formattedData = response.data.data.map(record => ({
          ...record,
          timeIn: record.timeIn ? convertTo12Hour(record.timeIn.substring(0, 5)) : null,
          timeOut: record.timeOut ? convertTo12Hour(record.timeOut.substring(0, 5)) : null
        }))
        setAttendance(formattedData || [])
      } else {
        showSnackbar('Failed to fetch afternoon attendance', 'error')
      }
    } catch (error) {
      showSnackbar('Error fetching afternoon attendance', 'error')
    }
  }

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'timeIn' || name === 'timeOut') {
      const time12 = convertTo12Hour(value)
      setAttendanceForm(prev => ({
        ...prev,
        [name]: time12
      }))
    } else {
      setAttendanceForm(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleAddNew = () => {
    setDialogMode('add')
    setSelectedId(null)
    setAttendanceForm(initialAttendanceForm)
    setOpenDialog(true)
  }

  const handleEdit = (record: AttendanceRecord) => {
    setDialogMode('edit')
    setSelectedId(record.id)
    setAttendanceForm({
      employeeId: record.employeeId,
      date: record.date,
      timeIn: record.timeIn || '',
      timeOut: record.timeOut || '',
      status: record.status
    })
    setOpenDialog(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const formattedData = {
        ...attendanceForm,
        timeIn: convertTo24Hour(attendanceForm.timeIn) + ':00',
        timeOut: convertTo24Hour(attendanceForm.timeOut) + ':00'
      }

      const response = await attendanceAPI.recordAfternoonAttendance(formattedData)

      if (response.data.success) {
        showSnackbar(
          `Successfully ${dialogMode === 'add' ? 'added' : 'updated'} attendance`,
          'success'
        )
        handleCloseDialog()
        fetchAttendance()
      } else {
        showSnackbar(response.data.message || 'Operation failed', 'error')
      }
    } catch (error) {
      showSnackbar('Error saving attendance', 'error')
    }
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setAttendanceForm(initialAttendanceForm)
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
          Record Afternoon Attendance
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Date</b></TableCell>
              <TableCell><b>Employee</b></TableCell>
              <TableCell><b>Time In</b></TableCell>
              <TableCell><b>Time Out</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendance.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  {record.firstName} {record.lastName} ({record.employeeId})
                </TableCell>
                <TableCell>{record.timeIn || '-'}</TableCell>
                <TableCell>{record.timeOut || '-'}</TableCell>
                <TableCell>
                  <span style={getStatusStyle(record.status)}>
                    {record.status}
                  </span>
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEdit(record)}>
                    <EditIcon />
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
            {dialogMode === 'add' ? 'Record Afternoon Attendance' : 'Edit Afternoon Attendance'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  name="employeeId"
                  label="Employee"
                  value={attendanceForm.employeeId}
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
                  name="date"
                  label="Date"
                  type="date"
                  value={attendanceForm.date}
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
                  name="timeIn"
                  label="Time In"
                  type="time"
                  value={convertTo24Hour(attendanceForm.timeIn)}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 60,
                    min: "13:00",
                    max: "18:00"
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="timeOut"
                  label="Time Out"
                  type="time"
                  value={convertTo24Hour(attendanceForm.timeOut)}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 60,
                    min: "13:00",
                    max: "18:00"
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  name="status"
                  label="Status"
                  value={attendanceForm.status}
                  onChange={handleInputChange}
                  fullWidth
                  required
                >
                  <MenuItem value="Present">Present</MenuItem>
                  <MenuItem value="Late">Late</MenuItem>
                  <MenuItem value="Absent">Absent</MenuItem>
                  <MenuItem value="Sick Leave">Sick Leave</MenuItem>
                  <MenuItem value="Vacation Leave">Vacation Leave</MenuItem>
                  <MenuItem value="Excused">Excused</MenuItem>
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

export default AfternoonAttendance