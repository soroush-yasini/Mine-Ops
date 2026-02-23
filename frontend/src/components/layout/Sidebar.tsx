import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Divider, Toolbar, Typography, Box, Collapse, useTheme, useMediaQuery,
  IconButton,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PersonIcon from '@mui/icons-material/Person'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ScienceIcon from '@mui/icons-material/Science'
import PeopleIcon from '@mui/icons-material/People'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CategoryIcon from '@mui/icons-material/Category'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import MenuIcon from '@mui/icons-material/Menu'
import { useAuth } from '../../context/AuthContext'

const DRAWER_WIDTH = 260

interface NavItem {
  label: string
  path?: string
  icon: React.ReactNode
  children?: NavItem[]
  managerOnly?: boolean
}

const navItems: NavItem[] = [
  { label: 'داشبورد', path: '/', icon: <DashboardIcon /> },
  {
    label: 'مدیریت',
    icon: <PersonIcon />,
    children: [
      { label: 'رانندگان', path: '/drivers', icon: <PersonIcon /> },
      { label: 'ماشین‌ها', path: '/trucks', icon: <LocalShippingIcon /> },
      { label: 'سایت‌های آسیاب', path: '/grinding-sites', icon: <LocationOnIcon /> },
    ],
  },
  {
    label: 'حمل‌ونقل',
    icon: <LocalShippingIcon />,
    children: [
      { label: 'معدن به آسیاب', path: '/mine-transport', icon: <LocalShippingIcon /> },
      { label: 'آسیاب به کارخانه', path: '/bunker-transport', icon: <LocalShippingIcon /> },
    ],
  },
  { label: 'هزینه آسیاب', path: '/grinding-costs', icon: <AttachMoneyIcon /> },
  {
    label: 'آزمایشگاه',
    icon: <ScienceIcon />,
    children: [
      { label: 'دسته‌های آنالیز', path: '/lab/batches', icon: <ScienceIcon /> },
      { label: 'انواع نمونه', path: '/sample-types', icon: <CategoryIcon />, managerOnly: true },
    ],
  },
  { label: 'مدیریت کاربران', path: '/users', icon: <PeopleIcon />, managerOnly: true },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isManager } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [expandedItems, setExpandedItems] = useState<string[]>(['مدیریت', 'حمل‌ونقل', 'آزمایشگاه'])

  const toggleExpand = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    )
  }

  const handleNavClick = (path: string) => {
    navigate(path)
    if (isMobile) onClose()
  }

  const renderNavItem = (item: NavItem, depth = 0) => {
    if (item.managerOnly && !isManager) return null

    if (item.children) {
      const isExpanded = expandedItems.includes(item.label)
      return (
        <div key={item.label}>
          <ListItem disablePadding>
            <ListItemButton onClick={() => toggleExpand(item.label)} sx={{ pr: depth * 2 + 2 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </ListItem>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List disablePadding>
              {item.children.map(child => renderNavItem(child, depth + 1))}
            </List>
          </Collapse>
        </div>
      )
    }

    const isActive = location.pathname === item.path
    return (
      <ListItem key={item.label} disablePadding>
        <ListItemButton
          onClick={() => item.path && handleNavClick(item.path)}
          selected={isActive}
          sx={{ pr: depth * 2 + 2 }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
          <ListItemText primary={item.label} />
        </ListItemButton>
      </ListItem>
    )
  }

  const drawerContent = (
    <>
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          معدن طلا
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map(item => renderNavItem(item))}
      </List>
    </>
  )

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        anchor="right"
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
      >
        {drawerContent}
      </Drawer>
    )
  }

  return (
    <Drawer
      variant="permanent"
      anchor="right"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
      }}
    >
      {drawerContent}
    </Drawer>
  )
}

export { DRAWER_WIDTH }
export type { SidebarProps }
