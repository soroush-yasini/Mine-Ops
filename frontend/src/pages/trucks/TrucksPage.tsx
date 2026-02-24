import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import DataTable from '../../components/common/DataTable'
import { useTrucks, useDeleteTruck, Truck } from '../../hooks/useTrucks'
import TruckForm from './TruckForm'
import { Pencil, Trash2, Plus } from 'lucide-react'
import fa from '../../i18n/fa'

export default function TrucksPage() {
  const { data: trucks = [], isLoading } = useTrucks()
  const deleteTruck = useDeleteTruck()
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null)
  const [showForm, setShowForm] = useState(false)

  const columns: ColumnDef<Truck>[] = [
    { accessorKey: 'id', header: fa.common.row, size: 60 },
    { accessorKey: 'plate_number', header: fa.trucks.plateNumber },
    {
      id: 'default_driver',
      header: fa.trucks.defaultDriver,
      cell: ({ row }) => row.original.default_driver?.full_name || '—'
    },
    {
      accessorKey: 'is_active',
      header: fa.trucks.isActive,
      cell: ({ getValue }) => (
        <span className={`text-xs px-2 py-0.5 rounded-full ${getValue() ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {getValue() ? fa.common.active : fa.common.inactive}
        </span>
      )
    },
    {
      id: 'actions',
      header: fa.common.actions,
      cell: ({ row }) => (
        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => { setEditingTruck(row.original); setShowForm(true) }}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => { if (confirm('حذف شود؟')) deleteTruck.mutate(row.original.id) }}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ]

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{fa.trucks.title}</h1>
        <button
          onClick={() => { setEditingTruck(null); setShowForm(true) }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus size={16} />
          {fa.trucks.addTruck}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <DataTable data={trucks} columns={columns} isLoading={isLoading} />
      </div>

      {showForm && (
        <TruckForm truck={editingTruck} onClose={() => setShowForm(false)} />
      )}
    </div>
  )
}
