import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box 
} from '@mui/material'
import { 
  Notifications as NotificationsIcon, 
  AccountCircle as ProfileIcon 
} from '@mui/icons-material'

const Topbar = () => {
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: 1300,
        width: 'calc(100% - 280px)',
        ml: '280px',
        backgroundColor: '#ffffff',
        color: '#000000',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" noWrap>
          Dashboard
        </Typography>
        
        <Box>
          <IconButton>
            <NotificationsIcon />
          </IconButton>
          <IconButton>
            <ProfileIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Topbar