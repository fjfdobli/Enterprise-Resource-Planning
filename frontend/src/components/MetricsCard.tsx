import { Paper, Box, Typography } from '@mui/material'

interface MetricsCardProps {
  icon: React.ReactNode
  title: string
  value: string | number
  bgColor?: string
}

export default function MetricsCard({ icon, title, value, bgColor = 'white' }: MetricsCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        backgroundColor: bgColor,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box>
        <Typography color="text.secondary" variant="body2">
          {title}
        </Typography>
        <Typography variant="h4" sx={{ mt: 1, fontWeight: 600 }}>
          {value}
        </Typography>
      </Box>
      <Box sx={{ color: 'text.secondary' }}>{icon}</Box>
    </Paper>
  )
}