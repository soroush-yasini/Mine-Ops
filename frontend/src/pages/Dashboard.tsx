import { useTonnageUnit } from '../hooks/useTonnageUnit'
import { useTruckTrips } from '../hooks/useTruckTrips'
import { useBunkerTrips } from '../hooks/useBunkerTrips'
import { useFinancialLedger } from '../hooks/useFinancialLedger'
import { useFacilities } from '../hooks/useFacilities'
import { useLabReports } from '../hooks/useLabReports'
import { formatTonnage, formatNumber } from '../lib/utils'
import fa from '../i18n/fa'

function KpiCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-800 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}

export default function Dashboard() {
  const { unit } = useTonnageUnit()
  const { data: truckTrips = [] } = useTruckTrips()
  const { data: bunkerTrips = [] } = useBunkerTrips()
  const { data: ledger = [] } = useFinancialLedger()
  const { data: facilities = [] } = useFacilities()
  const { data: labReports = [] } = useLabReports()

  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const thisMonthMineTrips = truckTrips.filter(t => t.date >= monthStart)
  const thisMonthBunkerTrips = bunkerTrips.filter(t => t.date >= monthStart)
  const totalTonnageMine = thisMonthMineTrips.reduce((s, t) => s + t.tonnage_kg, 0)
  const totalTonnageBunker = thisMonthBunkerTrips.reduce((s, t) => s + t.tonnage_kg, 0)
  const unpaidTruckTrips = truckTrips.filter(t => !t.is_paid).length
  const unpaidBunkerTrips = bunkerTrips.filter(t => !t.is_paid).length
  const discrepancyCount = ledger.filter(e => e.discrepancy_flag && e.investigation_status === 'pending').length

  // Avg Au ppm over last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]
  const recentSamples = labReports
    .filter(r => r.issue_date >= thirtyDaysAgoStr)
    .flatMap(r => r.samples)
  const avgAu = recentSamples.length > 0
    ? (recentSamples.reduce((s, r) => s + r.au_ppm, 0) / recentSamples.length).toFixed(3)
    : '—'

  const kpis = [
    { label: fa.dashboard.totalTonnageMine, value: formatTonnage(totalTonnageMine, unit), icon: '⛏️' },
    { label: fa.dashboard.totalTonnageBunker, value: formatTonnage(totalTonnageBunker, unit), icon: '🚛' },
    { label: fa.dashboard.unpaidTruckTrips, value: formatNumber(unpaidTruckTrips), icon: '🔴' },
    { label: fa.dashboard.unpaidBunkerTrips, value: formatNumber(unpaidBunkerTrips), icon: '🟠' },
    { label: fa.dashboard.discrepancyCount, value: formatNumber(discrepancyCount), icon: '🚨' },
    { label: fa.dashboard.avgAuPpm, value: avgAu === '—' ? '—' : `${avgAu} ppm`, icon: '🧪' },
  ]

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{fa.dashboard.title}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {facilities.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">سایت‌های خردایش</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {facilities.map(f => (
              <div key={f.id} className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
                <div className="text-2xl font-bold text-blue-600">{f.code}</div>
                <div className="text-gray-800 font-medium mt-1">{f.name_fa}</div>
                <div className="text-gray-500 text-sm">{f.name_en}</div>
                <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${f.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {f.is_active ? fa.common.active : fa.common.inactive}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
