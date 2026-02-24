import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import DataTable from '../../components/common/DataTable'
import { useFacilities, useDeleteFacility, Facility } from '../../hooks/useFacilities'
import FacilityForm from './FacilityForm'
import { Pencil, Trash2, Plus } from 'lucide-react'
import fa from '../../i18n/fa'

export default function FacilitiesPage() {
  const { data: facilities = [], isLoading } = useFacilities()
  const deleteFacility = useDeleteFacility()
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null)
  const [showForm, setShowForm] = useState(false)

  const columns: ColumnDef<Facility>[] = [
    { accessorKey: 'id', header: fa.common.row, size: 60 },
    { accessorKey: 'code', header: fa.facilities.code },
    { accessorKey: 'name_fa', header: fa.facilities.nameFa },
    { accessorKey: 'name_en', header: fa.facilities.nameEn, cell: ({ getValue }) => <span dir="ltr">{getValue() as string}</span> },
    {
      accessorKey: 'is_active',
      header: fa.facilities.isActive,
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
          <button onClick={() => { setEditingFacility(row.original); setShowForm(true) }} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
            <Pencil size={14} />
          </button>
          <button onClick={() => { if (confirm('حذف شود؟')) deleteFacility.mutate(row.original.id) }} className="p-1 text-red-600 hover:bg-red-50 rounded">
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ]

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{fa.facilities.title}</h1>
        <button
          onClick={() => { setEditingFacility(null); setShowForm(true) }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus size={16} />
          {fa.facilities.addFacility}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <DataTable data={facilities} columns={columns} isLoading={isLoading} />
      </div>

      {showForm && (
        <FacilityForm facility={editingFacility} onClose={() => setShowForm(false)} />
      )}
    </div>
  )
}
