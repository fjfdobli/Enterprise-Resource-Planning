import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import { NavLink } from 'react-router-dom'
import { 
  Dashboard as DashboardIcon, 
  Group as ClientIcon, 
  ListAlt as OrdersIcon, 
  Inventory as InventoryIcon, 
  LocalShipping as SupplierIcon, 
  Person as EmployeesIcon, 
  AttachMoney as PayrollIcon, 
  Build as MachineIcon, 
  Assessment as ReportsIcon 
} from '@mui/icons-material'
import logo from '../assets/logo.jpg'

const menuItems = [
  { icon: DashboardIcon, label: 'Dashboard', path: '/' },
  { icon: ClientIcon, label: 'Client', path: '/clients' },
  { icon: OrdersIcon, label: 'Orders', path: '/orders' },
  { icon: InventoryIcon, label: 'Inventory', path: '/inventory' },
  { icon: SupplierIcon, label: 'Supplier', path: '/supplier' },
  { icon: EmployeesIcon, label: 'Employees', path: '/attendance' },
  { icon: PayrollIcon, label: 'Payroll', path: '/payroll' },
  { icon: MachineIcon, label: 'Machinery', path: '/machinery' },
  { icon: ReportsIcon, label: 'Reports', path: '/reports' }
]

export default function Sidebar() {
  return (
    <Box sx={{
      width: 280,
      bgcolor: 'background.paper',
      borderRight: 1,
      borderColor: 'divider',
      height: '100vh',
      position: 'fixed',
      zIndex: 1200
    }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <img 
          src={logo} 
          alt="Logo" 
          style={{ 
            width: 40, 
            height: 40, 
            objectFit: 'contain' 
          }} 
        />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          OPZON Printer & Supplies
        </Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.path}
            component={NavLink}
            to={item.path}
            sx={{
              color: 'text.primary',
              '&.active': {
                bgcolor: 'action.selected',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
                '& .MuiListItemText-primary': {
                  color: 'primary.main',
                  fontWeight: 600,
                },
              },
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemIcon>
              <item.icon />
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  )
}