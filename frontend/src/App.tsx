import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Box, Toolbar } from '@mui/material'
import RTLProvider from './components/layout/RTLProvider'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar, { DRAWER_WIDTH } from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import Login from './pages/auth/Login'
import Dashboard from './pages/Dashboard'
import DriverList from './pages/drivers/DriverList'
import TruckList from './pages/trucks/TruckList'
import GrindingSiteList from './pages/grinding_sites/GrindingSiteList'
import MineTransportList from './pages/mine_transport/MineTransportList'
import BunkerTransportList from './pages/bunker_transport/BunkerTransportList'
import GrindingCostList from './pages/grinding_costs/GrindingCostList'
import BatchList from './pages/lab/BatchList'
import BatchDetail from './pages/lab/BatchDetail'
import SampleTypeList from './pages/sample_types/SampleTypeList'
import UserList from './pages/users/UserList'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function ManagerGuard({ children }: { children: React.ReactNode }) {
  const { isManager } = useAuth()
  if (!isManager) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', direction: 'rtl' }}>
      <Topbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mr: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/drivers" element={<DriverList />} />
          <Route path="/trucks" element={<TruckList />} />
          <Route path="/grinding-sites" element={<GrindingSiteList />} />
          <Route path="/mine-transport" element={<MineTransportList />} />
          <Route path="/bunker-transport" element={<BunkerTransportList />} />
          <Route path="/grinding-costs" element={<GrindingCostList />} />
          <Route path="/lab/batches" element={<BatchList />} />
          <Route path="/lab/batches/:id" element={<BatchDetail />} />
          <Route
            path="/sample-types"
            element={<ManagerGuard><SampleTypeList /></ManagerGuard>}
          />
          <Route
            path="/users"
            element={<ManagerGuard><UserList /></ManagerGuard>}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  )
}

export default function App() {
  return (
    <RTLProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <AuthGuard>
                  <AppLayout />
                </AuthGuard>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </RTLProvider>
  )
}
