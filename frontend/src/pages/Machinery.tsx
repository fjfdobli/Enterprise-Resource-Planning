import React, { useState, useEffect } from 'react'
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField,  Grid, MenuItem, Tabs, Tab } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import BuildIcon from '@mui/icons-material/Build'
import { useNavigate } from 'react-router-dom'

interface MachineryRecord {
  id: number
  name: string
  model: string
  serialNumber: string
  purchaseDate: string
  lastMaintenanceDate: string
  nextMaintenanceDate: string
  status: 'Operational' | 'Under Maintenance' | 'Out of Service' | 'Retired'
  department: string
  location: string
  notes: string
}

interface RepairRequest {
  id: number
  machineryId: number
  machineryName: string
  requestDate: string
  urgency: 'Low' | 'Medium' | 'High' | 'Critical'
  description: string
  requestedBy: string
  status: 'Pending' | 'Approved' | 'In Progress' | 'Completed' | 'Rejected'
  approvedBy?: string
  completedDate?: string
  notes?: string
}

interface RepairRequestForm {
  machineryId: number
  urgency: 'Low' | 'Medium' | 'High' | 'Critical'
  description: string
  notes: string
}

const initialRepairForm: RepairRequestForm = {
  machineryId: 0,
  urgency: 'Medium',
  description: '',
  notes: ''
}

const initialMachineryForm: MachineryRecord = {
  id: 0,
  name: '',
  model: '',
  serialNumber: '',
  purchaseDate: new Date().toISOString().split('T')[0],
  lastMaintenanceDate: new Date().toISOString().split('T')[0],
  nextMaintenanceDate: new Date().toISOString().split('T')[0],
  status: 'Operational',
  department: '',
  location: '',
  notes: ''
}

const getStatusStyle = (status: string) => {
  if (status === 'Operational') {
    return { backgroundColor: '#4CAF50', color: 'white', padding: '4px 12px', borderRadius: '16px', display: 'inline-block' }
  } else if (status === 'Under Maintenance') {
    return { backgroundColor: '#FFC107', color: 'black', padding: '4px 12px', borderRadius: '16px', display: 'inline-block' }
  } else if (status === 'Out of Service') {
    return { backgroundColor: '#F44336', color: 'white', padding: '4px 12px', borderRadius: '16px', display: 'inline-block' }
  } else if (status === 'Retired') {
    return { backgroundColor: '#9E9E9E', color: 'white', padding: '4px 12px', borderRadius: '16px', display: 'inline-block' }
  } else {
    return {}
  }
}

const getUrgencyStyle = (urgency: string) => {
  if (urgency === 'Low') {
    return { backgroundColor: '#2196F3', color: 'white', padding: '4px 12px', borderRadius: '16px', display: 'inline-block' }
  } else if (urgency === 'Medium') {
    return { backgroundColor: '#FF9800', color: 'black', padding: '4px 12px', borderRadius: '16px', display: 'inline-block' }
  } else if (urgency === 'High') {
    return { backgroundColor: '#F44336', color: 'white', padding: '4px 12px', borderRadius: '16px', display: 'inline-block' }
  } else if (urgency === 'Critical') {
    return { backgroundColor: '#B71C1C', color: 'white', padding: '4px 12px', borderRadius: '16px', display: 'inline-block' }
  } else {
    return {}
  }
}

const getRepairStatusStyle = (status: string) => {
  if (status === 'Pending') {
    return { backgroundColor: '#FFC107', color: 'black', padding: '4px 12px', borderRadius: '16px', display: 'inline-block' }
  } else if (status === 'Approved') {
    return { backgroundColor: '#2196F3', color: 'white', padding: '4px 12px', borderRadius: '16px', display: 'inline-block' }
  } else if (status === 'In Progress') {
    return { backgroundColor: '#FF9800', color: 'black', padding: '4px 12px', borderRadius: '16px', display: 'inline-block' }
  } else if (status === 'Completed') {
    return { backgroundColor: '#4CAF50', color: 'white', padding: '4px 12px', borderRadius: '16px', display: 'inline-block' }
  } else if (status === 'Rejected') {
    return { backgroundColor: '#F44336', color: 'white', padding: '4px 12px', borderRadius: '16px', display: 'inline-block' }
  } else {
    return {}
  }
}

const departments = [
  'Production',
  'Manufacturing',
  'Assembly',
  'Quality Control',
  'Maintenance',
  'Warehouse'
]

const Machinery = () => {
  const navigate = useNavigate()
  const [tabValue, setTabValue] = useState('machinery')
  const [machinery, setMachinery] = useState<MachineryRecord[]>([])
  const [repairRequests, setRepairRequests] = useState<RepairRequest[]>([])
  const [openMachineryDialog, setOpenMachineryDialog] = useState(false)
  const [openRepairDialog, setOpenRepairDialog] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [selectedMachinery, setSelectedMachinery] = useState<MachineryRecord | null>(null)
  const [machineryForm, setMachineryForm] = useState<MachineryRecord>(initialMachineryForm)
  const [repairForm, setRepairForm] = useState<RepairRequestForm>(initialRepairForm)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  useEffect(() => {
    fetchMachinery()
    fetchRepairRequests()
  }, [])

  const fetchMachinery = async () => {
    try {
      // Replace with your actual API call
      const response = await fetch('/api/machinery')
      const data = await response.json()
      setMachinery(data || [])
    } catch (error) {
      showSnackbar('Error fetching machinery data', 'error')
    }
  }

  const fetchRepairRequests = async () => {
    try {
      // Replace with your actual API call
      const response = await fetch('/api/repair-requests')
      const data = await response.json()
      setRepairRequests(data || [])
    } catch (error) {
      showSnackbar('Error fetching repair requests', 'error')
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue)
  }

  const handleMachineryFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setMachineryForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddMachinery = () => {
    setDialogMode('add')
    setMachineryForm(initialMachineryForm)
    setOpenMachineryDialog(true)
  }

  const handleEditMachinery = (machine: MachineryRecord) => {
    setDialogMode('edit')
    setMachineryForm(machine)
    setOpenMachineryDialog(true)
  }

  const handleDeleteMachinery = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this machinery?')) {
      try {
        // Replace with your actual API call
        await fetch(`/api/machinery/${id}`, { method: 'DELETE' })
        showSnackbar('Machinery deleted successfully', 'success')
        fetchMachinery()
      } catch (error) {
        showSnackbar('Error deleting machinery', 'error')
      }
    }
  }

  const handleMachinerySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = dialogMode === 'add' ? '/api/machinery' : `/api/machinery/${machineryForm.id}`
      const method = dialogMode === 'add' ? 'POST' : 'PUT'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(machineryForm)
      })

      if (response.ok) {
        showSnackbar(
          `Successfully ${dialogMode === 'add' ? 'added' : 'updated'} machinery`,
          'success'
        )
        handleCloseMachineryDialog()
        fetchMachinery()
      } else {
        showSnackbar('Operation failed', 'error')
      }
    } catch (error) {
      showSnackbar('Error saving machinery', 'error')
    }
  }

  const handleCloseMachineryDialog = () => {
    setOpenMachineryDialog(false)
    setMachineryForm(initialMachineryForm)
  }

  const handleRepairRequest = (machine: MachineryRecord) => {
    setSelectedMachinery(machine)
    setRepairForm({
      ...initialRepairForm,
      machineryId: machine.id
    })
    setOpenRepairDialog(true)
  }

  const handleOpenRepairDialog = () => {
    setSelectedMachinery(null)
    setRepairForm({
      ...initialRepairForm,
      machineryId: 0 // No machine pre-selected
    })
    setOpenRepairDialog(true)
  }

  const handleRepairFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRepairForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRepairSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let machineryName = ''
    if (!selectedMachinery) {
      const selectedMachine = machinery.find(m => m.id === Number(repairForm.machineryId))
      machineryName = selectedMachine ? selectedMachine.name : ''
    } else {
      machineryName = selectedMachinery.name
    }

    try {
      const response = await fetch('/api/repair-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...repairForm,
          machineryName,
          requestDate: new Date().toISOString(),
          status: 'Pending'
        })
      })

      if (response.ok) {
        showSnackbar('Repair request submitted successfully', 'success')
        handleCloseRepairDialog()
        fetchRepairRequests()
      } else {
        showSnackbar('Failed to submit repair request', 'error')
      }
    } catch (error) {
      showSnackbar('Error submitting repair request', 'error')
    }
  }

  const handleUpdateRepairStatus = async (requestId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/repair-requests/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        showSnackbar('Repair request status updated successfully', 'success')
        fetchRepairRequests()
      } else {
        showSnackbar('Failed to update repair request status', 'error')
      }
    } catch (error) {
      showSnackbar('Error updating repair request status', 'error')
    }
  }

  const handleCloseRepairDialog = () => {
    setOpenRepairDialog(false)
    setSelectedMachinery(null)
    setRepairForm(initialRepairForm)
  }

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Machinery Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage machinery inventory, maintenance schedules, and repair requests
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Machinery List" value="machinery" />
        <Tab label="Repair Requests" value="repairs" />
      </Tabs>

      {tabValue === 'machinery' && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" onClick={handleAddMachinery}>
            Add New Machinery
          </Button>
        </Box>
      )}
      {tabValue === 'repairs' && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" onClick={handleOpenRepairDialog}>
            Submit Repair Request
          </Button>
        </Box>
      )}

      {tabValue === 'machinery' && (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Name</b></TableCell>
                <TableCell><b>Model</b></TableCell>
                <TableCell><b>Department</b></TableCell>
                <TableCell><b>Location</b></TableCell>
                <TableCell><b>Next Maintenance</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {machinery.map((machine) => (
                <TableRow key={machine.id}>
                  <TableCell>{machine.name}</TableCell>
                  <TableCell>{machine.model}</TableCell>
                  <TableCell>{machine.department}</TableCell>
                  <TableCell>{machine.location}</TableCell>
                  <TableCell>{new Date(machine.nextMaintenanceDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span style={getStatusStyle(machine.status)}>
                      {machine.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleEditMachinery(machine)}
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleRepairRequest(machine)}
                      title="Request Repair"
                    >
                      <BuildIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteMachinery(machine.id)}
                      color="error"
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tabValue === 'repairs' && (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Request Date</b></TableCell>
                <TableCell><b>Machine</b></TableCell>
                <TableCell><b>Description</b></TableCell>
                <TableCell><b>Urgency</b></TableCell>
                <TableCell><b>Requested By</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {repairRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                  <TableCell>{request.machineryName}</TableCell>
                  <TableCell>{request.description}</TableCell>
                  <TableCell>
                    <span style={getUrgencyStyle(request.urgency)}>
                      {request.urgency}
                    </span>
                  </TableCell>
                  <TableCell>{request.requestedBy}</TableCell>
                  <TableCell>
                    <span style={getRepairStatusStyle(request.status)}>
                      {request.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {request.status === 'Pending' && (
                      <>
                        <Button
                          size="small"
                          onClick={() => handleUpdateRepairStatus(request.id, 'Approved')}
                          color="primary"
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleUpdateRepairStatus(request.id, 'Rejected')}
                          color="error"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {request.status === 'Approved' && (
                      <Button
                        size="small"
                        onClick={() => handleUpdateRepairStatus(request.id, 'In Progress')}
                        color="primary"
                      >
                        Start Repair
                      </Button>
                    )}
                    {request.status === 'In Progress' && (
                      <Button
                        size="small"
                        onClick={() => handleUpdateRepairStatus(request.id, 'Completed')}
                        color="primary"
                      >
                        Complete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Machinery Form Dialog */}
      <Dialog open={openMachineryDialog} onClose={handleCloseMachineryDialog} maxWidth="md" fullWidth>
        <form onSubmit={handleMachinerySubmit}>
          <DialogTitle>
            {dialogMode === 'add' ? 'Add New Machinery' : 'Edit Machinery'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  name="name"
                  label="Machinery Name"
                  value={machineryForm.name}
                  onChange={handleMachineryFormChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="model"
                  label="Model"
                  value={machineryForm.model}
                  onChange={handleMachineryFormChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="serialNumber"
                  label="Serial Number"
                  value={machineryForm.serialNumber}
                  onChange={handleMachineryFormChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  name="department"
                  label="Department"
                  value={machineryForm.department}
                  onChange={handleMachineryFormChange}
                  fullWidth
                  required
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="location"
                  label="Location"
                  value={machineryForm.location}
                  onChange={handleMachineryFormChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  name="status"
                  label="Status"
                  value={machineryForm.status}
                  onChange={handleMachineryFormChange}
                  fullWidth
                  required
                >
                  <MenuItem value="Operational">Operational</MenuItem>
                  <MenuItem value="Under Maintenance">Under Maintenance</MenuItem>
                  <MenuItem value="Out of Service">Out of Service</MenuItem>
                  <MenuItem value="Retired">Retired</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  name="purchaseDate"
                  label="Purchase Date"
                  type="date"
                  value={machineryForm.purchaseDate}
                  onChange={handleMachineryFormChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  name="lastMaintenanceDate"
                  label="Last Maintenance"
                  type="date"
                  value={machineryForm.lastMaintenanceDate}
                  onChange={handleMachineryFormChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  name="nextMaintenanceDate"
                  label="Next Maintenance"
                  type="date"
                  value={machineryForm.nextMaintenanceDate}
                  onChange={handleMachineryFormChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="notes"
                  label="Notes"
                  value={machineryForm.notes}
                  onChange={handleMachineryFormChange}
                  fullWidth
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseMachineryDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {dialogMode === 'add' ? 'Add' : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Repair Request Dialog */}
      <Dialog open={openRepairDialog} onClose={handleCloseRepairDialog} maxWidth="md" fullWidth>
        <form onSubmit={handleRepairSubmit}>
          <DialogTitle>Submit Repair Request</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                {selectedMachinery ? (
                  <Typography variant="subtitle1">
                    Machine: {selectedMachinery.name} ({selectedMachinery.model})
                  </Typography>
                ) : (
                  <TextField
                    select
                    name="machineryId"
                    label="Select Machinery"
                    value={repairForm.machineryId}
                    onChange={handleRepairFormChange}
                    fullWidth
                    required
                  >
                    {machinery.map((machine) => (
                      <MenuItem key={machine.id} value={machine.id}>
                        {machine.name} ({machine.model})
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  name="urgency"
                  label="Urgency Level"
                  value={repairForm.urgency}
                  onChange={handleRepairFormChange}
                  fullWidth
                  required
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Issue Description"
                  value={repairForm.description}
                  onChange={handleRepairFormChange}
                  fullWidth
                  required
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="notes"
                  label="Additional Notes"
                  value={repairForm.notes}
                  onChange={handleRepairFormChange}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRepairDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              Submit Request
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

export default Machinery