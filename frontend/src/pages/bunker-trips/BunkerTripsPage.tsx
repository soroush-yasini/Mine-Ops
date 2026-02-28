import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import DataTable from '../../components/common/DataTable'
import { useBunkerTrips, useDeleteBunkerTrip, BunkerTrip } from '../../hooks/useBunkerTrips'
import { useTrucks } from '../../hooks/useTrucks'
import { useDrivers } from '../../hooks/useDrivers'
import { useFacilities } from '../../hooks/useFacilities'
import BunkerTripForm from './BunkerTripForm'
import StatusBadge from '../../components/common/StatusBadge'
import { TonnageCell } from '../../components/common/TonnageToggle'
import { formatJalali } from '../../lib/jalali'
import { formatCurrency } from '../../lib/utils'
import { Pencil, Trash2, Plus, CreditCard } from 'lucide-react'
import fa from '../../i18n/fa'

export default function BunkerTripsPage() {
  const { data: trips = [], isLoading } = useBunkerTrips()
  const { data: trucks = [] } = useTrucks()
  const { data: drivers = [] } = useDrivers()
  const { data: facilities = [] } = useFacilities()
  const deleteTrip = useDeleteBunkerTrip()
  const [editingTrip, setEditingTrip] = useState<BunkerTrip | null>(null)
  const [payingTrip, setPayingTrip] = useState<BunkerTrip | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filterUnpaid, setFilterUnpaid] = useState(false)

  const displayedTrips = filterUnpaid ? trips.filter(t => !t.is_paid) : trips

  const truckMap = Object.fromEntries(trucks.map(t => [t.id, t.plate_number]))
  const driverMap = Object.fromEntries(drivers.map(d => [d.id, d.full_name]))
  const facilityMap = Object.fromEntries(facilities.map(f => [f.id, f.name_fa]))

  const columns: ColumnDef<BunkerTrip>[] = [
    { accessorKey: 'id', header: fa.common.row, size: 60 },
    { accessorKey: 'date', header: fa.bunkerTrips.date, cell: ({ getValue }) => formatJalali(getValue() as string) },
    { accessorKey: 'time', header: fa.bunkerTrips.time, cell: ({ getValue }) => (getValue() as string) || '—' },
    { id: 'truck', header: fa.bunkerTrips.truck, cell: ({ row }) => truckMap[row.original.truck_id] || row.original.truck_id },
    { id: 'driver', header: fa.bunkerTrips.driver, cell: ({ row }) => driverMap[row.original.driver_id] || row.original.driver_id },
    { accessorKey: 'receipt_number', header: fa.bunkerTrips.receiptNumber },
    {
      id: 'tonnage',
      header: fa.bunkerTrips.tonnage,
      cell: ({ row }) => <TonnageCell valueKg={row.original.tonnage_kg} />
    },
    { id: 'origin', header: fa.bunkerTrips.origin, cell: ({ row }) => facilityMap[row.original.origin_facility_id] || row.original.origin_facility_id },
    { accessorKey: 'total_amount', header: fa.bunkerTrips.totalAmount, cell: ({ getValue }) => formatCurrency(getValue() as number | null) },
    {
      id: 'status',
      header: fa.common.status,
      cell: ({ row }) => <StatusBadge variant={row.original.status || (row.original.is_paid ? 'paid' : 'initialized')} />
    },
    {
      id: 'actions',
      header: fa.common.actions,
      cell: ({ row }) => (
        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
          {!row.original.is_paid && (
            <button onClick={() => { setPayingTrip(row.original); setShowForm(true) }} className="p-1 text-green-600 hover:bg-green-50 rounded" title={fa.bunkerTrips.registerPayment}>
              <CreditCard size={14} />
            </button>
          )}
          <button onClick={() => { setEditingTrip(row.original); setPayingTrip(null); setShowForm(true) }} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
            <Pencil size={14} />
          </button>
          <button onClick={() => { if (confirm('حذف شود؟')) deleteTrip.mutate(row.original.id) }} className="p-1 text-red-600 hover:bg-red-50 rounded">
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ]

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{fa.bunkerTrips.title}</h1>
        <div className="flex gap-3 items-center">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={filterUnpaid} onChange={e => setFilterUnpaid(e.target.checked)} className="rounded" />
            فقط پرداخت نشده
          </label>
          <button
            onClick={() => { setEditingTrip(null); setPayingTrip(null); setShowForm(true) }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus size={16} />
            {fa.bunkerTrips.addTrip}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <DataTable data={displayedTrips} columns={columns} isLoading={isLoading} />
      </div>

      {showForm && (
        <BunkerTripForm
          trip={editingTrip}
          paymentMode={!!payingTrip}
          onClose={() => { setShowForm(false); setEditingTrip(null); setPayingTrip(null) }}
        />
      )}
    </div>
  )
}
