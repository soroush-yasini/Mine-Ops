import { useState } from 'react'
import { useCreateTruck, useUpdateTruck, Truck } from '../../hooks/useTrucks'
import { useDrivers } from '../../hooks/useDrivers'
import fa from '../../i18n/fa'
import { X } from 'lucide-react'

interface TruckFormProps {
  truck: Truck | null
  onClose: () => void
}

export default function TruckForm({ truck, onClose }: TruckFormProps) {
  const { data: drivers = [] } = useDrivers()
  const [form, setForm] = useState({
    plate_number: truck?.plate_number || '',
    default_driver_id: truck?.default_driver_id ?? null,
    is_active: truck?.is_active ?? true,
  })
  const createTruck = useCreateTruck()
  const updateTruck = useUpdateTruck()
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (truck) {
        await updateTruck.mutateAsync({ id: truck.id, default_driver: null, ...form })
      } else {
        await createTruck.mutateAsync(form)
      }
      onClose()
    } catch {
      setError('خطا در ذخیره‌سازی')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl" dir="rtl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{truck ? fa.trucks.edit : fa.trucks.addTruck}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        {error && <div className="mb-3 text-sm text-red-600 bg-red-50 rounded p-2">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{fa.trucks.plateNumber} *</label>
            <input
              type="text"
              value={form.plate_number}
              onChange={e => setForm(f => ({ ...f, plate_number: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{fa.trucks.defaultDriver}</label>
            <select
              value={form.default_driver_id ?? ''}
              onChange={e => setForm(f => ({ ...f, default_driver_id: e.target.value ? Number(e.target.value) : null }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— انتخاب راننده —</option>
              {drivers.filter(d => d.is_active).map(d => (
                <option key={d.id} value={d.id}>{d.full_name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active_truck"
              checked={form.is_active}
              onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="is_active_truck" className="text-sm text-gray-700">{fa.trucks.isActive}</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={createTruck.isPending || updateTruck.isPending}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {fa.common.save}
            </button>
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              {fa.common.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
