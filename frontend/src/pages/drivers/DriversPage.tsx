import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import DataTable from '../../components/common/DataTable'
import { useDrivers, useDeleteDriver, Driver } from '../../hooks/useDrivers'
import DriverForm from './DriverForm'
import { Pencil, Trash2, Plus } from 'lucide-react'
import fa from '../../i18n/fa'

export default function DriversPage() {
  const { data: drivers = [], isLoading } = useDrivers()
  const deleteDriver = useDeleteDriver()
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [showForm, setShowForm] = useState(false)

  const columns: ColumnDef<Driver>[] = [
    { accessorKey: 'id', header: fa.common.row, size: 60 },
    { accessorKey: 'full_name', header: fa.drivers.fullName },
    { accessorKey: 'phone', header: fa.drivers.phone, cell: ({ getValue }) => (getValue() as string) || '—' },
    {
      accessorKey: 'bank_account',
      header: fa.drivers.bankAccount,
      cell: ({ getValue }) => {
        const v = getValue() as string | null
        return v ? <span className="font-mono text-xs">{v}</span> : '—'
      }
    },
    {
      accessorKey: 'is_active',
      header: fa.drivers.isActive,
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
            onClick={() => { setEditingDriver(row.original); setShowForm(true) }}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => { if (confirm('حذف شود؟')) deleteDriver.mutate(row.original.id) }}
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
        <h1 className="text-2xl font-bold text-gray-800">{fa.drivers.title}</h1>
        <button
          onClick={() => { setEditingDriver(null); setShowForm(true) }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus size={16} />
          {fa.drivers.addDriver}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <DataTable data={drivers} columns={columns} isLoading={isLoading} />
      </div>

      {showForm && (
        <DriverForm
          driver={editingDriver}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
