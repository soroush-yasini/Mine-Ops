import { AppBar, Toolbar, Typography, Button, Box, IconButton, useMediaQuery, useTheme } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import { useAuth } from '../../context/AuthContext'
import { DRAWER_WIDTH } from './Sidebar'

interface TopbarProps {
  onMenuClick: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <AppBar
      position="fixed"
      sx={{
        width: isMobile ? '100%' : `calc(100% - ${DRAWER_WIDTH}px)`,
        mr: isMobile ? 0 : `${DRAWER_WIDTH}px`,
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton color="inherit" onClick={onMenuClick} edge="start" sx={{ ml: 1 }}>
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
          عملیات معدن
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {user?.full_name || user?.username}
          </Typography>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={logout}
            size="small"
          >
            خروج
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
