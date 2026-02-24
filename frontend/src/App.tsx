import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TonnageUnitProvider } from './hooks/useTonnageUnit'
import AppShell from './components/layout/AppShell'
import Dashboard from './pages/Dashboard'
import DriversPage from './pages/drivers/DriversPage'
import TrucksPage from './pages/trucks/TrucksPage'
import FacilitiesPage from './pages/facilities/FacilitiesPage'
import TruckTripsPage from './pages/truck-trips/TruckTripsPage'
import BunkerTripsPage from './pages/bunker-trips/BunkerTripsPage'
import LabReportsPage from './pages/lab/LabReportsPage'
import FinancialLedgerPage from './pages/financial-ledger/FinancialLedgerPage'
import ImportPage from './pages/import/ImportPage'

export default function App() {
  return (
    <TonnageUnitProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="drivers" element={<DriversPage />} />
            <Route path="trucks" element={<TrucksPage />} />
            <Route path="facilities" element={<FacilitiesPage />} />
            <Route path="truck-trips" element={<TruckTripsPage />} />
            <Route path="bunker-trips" element={<BunkerTripsPage />} />
            <Route path="lab" element={<LabReportsPage />} />
            <Route path="financial-ledger" element={<FinancialLedgerPage />} />
            <Route path="import" element={<ImportPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TonnageUnitProvider>
  )
}
