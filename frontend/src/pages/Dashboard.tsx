import { Box, Grid, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow, List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import { Print, People, Inventory, TrendingUp, Circle as CircleIcon } from '@mui/icons-material'
import MetricsCard from '../components/MetricsCard'
import Chart from '../components/Chart'

export default function Dashboard() {
  const monthlyOrderData = [
    { month: 'Jan', orders: 65 },
    { month: 'Feb', orders: 75 },
    { month: 'Mar', orders: 85 },
    { month: 'Apr', orders: 70 },
    { month: 'May', orders: 80 },
    { month: 'Jun', orders: 95 },
    { month: 'Jul', orders: 80 },
    { month: 'Aug', orders: 100 },
    { month: 'Sept', orders: 75 },
    { month: 'Oct', orders: 77 },
    { month: 'Nov', orders: 40 },
    { month: 'Dec', orders: 95 }
  ]

  const revenueData = [
    { month: 'Jan', revenue: 120000 },
    { month: 'Feb', revenue: 150000 },
    { month: 'Mar', revenue: 180000 },
    { month: 'Apr', revenue: 140000 },
    { month: 'May', revenue: 160000 },
    { month: 'Jun', revenue: 200000 },
    { month: 'Jul', revenue: 150000 },
    { month: 'Aug', revenue: 80000 },
    { month: 'Sept', revenue: 100000 },
    { month: 'Oct', revenue: 174000 },
    { month: 'Nov', revenue: 182350 },
    { month: 'Dec', revenue: 155190 }
  ]

  const lowStockItems = [
    { item: 'CB Top White Short', current: 5, reorder: 20 },
    { item: 'Black Ink', current: 3, reorder: 15 },
    { item: 'A4 Bond Paper', current: 8, reorder: 25 }
  ]

  const notifications = [
    { type: 'warning', message: 'Low ink supply for Heidelberg printer', time: '2 hours ago' },
    { type: 'info', message: 'New order received from Davao Tech Solutions', time: '3 hours ago' },
    { type: 'warning', message: 'Maintenance due for Ryobi printer', time: '5 hours ago' },
    { type: 'success', message: 'Monthly revenue target achieved', time: '1 day ago' }
  ]

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Dashboard</Typography>
        <Typography color="text.secondary">Welcome to Opzon's Printer & Supplies</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Metrics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            icon={<Print />}
            title="Today's Orders"
            value="24"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            icon={<People />}
            title="Total Clients"
            value="156"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            icon={<Inventory />}
            title="Low Stock Items"
            value="3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricsCard
            icon={<TrendingUp />}
            title="Today's Revenue"
            value="₱24,500"
          />
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Monthly Orders Trend</Typography>
            <Chart data={monthlyOrderData} dataKey="orders" xKey="month" label="Orders" />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Revenue Overview</Typography>
            <Chart data={revenueData} dataKey="revenue" xKey="month" label="Revenue (₱)" />
          </Paper>
        </Grid>

        {/* Low Stock Items */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Low Stock Items</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Current Stock</TableCell>
                  <TableCell>Reorder Level</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lowStockItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.item}</TableCell>
                    <TableCell sx={{ color: 'error.main' }}>{item.current}</TableCell>
                    <TableCell>{item.reorder}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Notifications</Typography>
            <List>
              {notifications.map((notification, index) => (
                <ListItem key={index} sx={{ py: 1 }}>
                  <ListItemIcon>
                    <CircleIcon
                      sx={{
                        fontSize: 'small',
                        color: notification.type === 'warning' 
                          ? 'warning.main' 
                          : notification.type === 'info'
                          ? 'info.main'
                          : 'success.main'
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.message}
                    secondary={notification.time}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}