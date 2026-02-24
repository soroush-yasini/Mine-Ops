import { useState } from 'react'
import { useCreateDriver, useUpdateDriver, Driver } from '../../hooks/useDrivers'
import fa from '../../i18n/fa'
import { X } from 'lucide-react'

interface DriverFormProps {
  driver: Driver | null
  onClose: () => void
}

export default function DriverForm({ driver, onClose }: DriverFormProps) {
  const [form, setForm] = useState({
    full_name: driver?.full_name || '',
    bank_account: driver?.bank_account || '',
    phone: driver?.phone || '',
    is_active: driver?.is_active ?? true,
  })
  const createDriver = useCreateDriver()
  const updateDriver = useUpdateDriver()
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (driver) {
        await updateDriver.mutateAsync({ id: driver.id, ...form })
      } else {
        await createDriver.mutateAsync(form)
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
          <h2 className="text-lg font-bold">{driver ? fa.drivers.edit : fa.drivers.addDriver}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        {error && <div className="mb-3 text-sm text-red-600 bg-red-50 rounded p-2">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{fa.drivers.fullName} *</label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{fa.drivers.phone}</label>
            <input
              type="text"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{fa.drivers.bankAccount}</label>
            <input
              type="text"
              value={form.bank_account}
              onChange={e => setForm(f => ({ ...f, bank_account: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              dir="ltr"
              placeholder="IR..."
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">{fa.drivers.isActive}</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={createDriver.isPending || updateDriver.isPending}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {fa.common.save}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              {fa.common.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
