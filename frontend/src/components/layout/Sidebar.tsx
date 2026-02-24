import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Truck, Building2,
  Package, FlaskConical, Wallet, Upload
} from 'lucide-react'
import { cn } from '../../lib/utils'
import fa from '../../i18n/fa'

const sections = [
  {
    label: fa.nav.basicInfo,
    items: [
      { to: '/drivers', icon: Users, label: fa.nav.drivers },
      { to: '/trucks', icon: Truck, label: fa.nav.trucks },
      { to: '/facilities', icon: Building2, label: fa.nav.facilities },
    ]
  },
  {
    label: fa.nav.operations,
    items: [
      { to: '/truck-trips', icon: Truck, label: fa.nav.truckTrips },
      { to: '/bunker-trips', icon: Package, label: fa.nav.bunkerTrips },
    ]
  },
  {
    label: fa.nav.lab,
    items: [
      { to: '/lab', icon: FlaskConical, label: fa.nav.labReports },
    ]
  },
  {
    label: fa.nav.financial,
    items: [
      { to: '/financial-ledger', icon: Wallet, label: fa.nav.financialLedger },
    ]
  },
  {
    label: fa.nav.tools,
    items: [
      { to: '/import', icon: Upload, label: fa.nav.importData },
    ]
  },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-full shrink-0" dir="rtl">
      <div className="p-4 border-b border-slate-700">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <span className="text-yellow-400 font-bold text-xl">⛏️</span>
          <span className="font-bold text-lg leading-tight">{fa.app.title}</span>
        </NavLink>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => cn(
            'flex items-center gap-2 px-3 py-2 rounded-md text-sm mb-1 transition-colors',
            isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
          )}
        >
          <LayoutDashboard size={16} />
          {fa.app.dashboard}
        </NavLink>
        {sections.map(section => (
          <div key={section.label} className="mt-4">
            <div className="px-3 py-1 text-xs text-slate-500 font-semibold uppercase tracking-wider">
              {section.label}
            </div>
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm mb-1 transition-colors',
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                )}
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}
