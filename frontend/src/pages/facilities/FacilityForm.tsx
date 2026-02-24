import { useState } from 'react'
import { useCreateFacility, useUpdateFacility, Facility } from '../../hooks/useFacilities'
import fa from '../../i18n/fa'
import { X } from 'lucide-react'

interface FacilityFormProps {
  facility: Facility | null
  onClose: () => void
}

export default function FacilityForm({ facility, onClose }: FacilityFormProps) {
  const [form, setForm] = useState({
    code: facility?.code || '',
    name_fa: facility?.name_fa || '',
    name_en: facility?.name_en || '',
    is_active: facility?.is_active ?? true,
  })
  const createFacility = useCreateFacility()
  const updateFacility = useUpdateFacility()
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (facility) {
        await updateFacility.mutateAsync({ id: facility.id, ...form })
      } else {
        await createFacility.mutateAsync(form)
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
          <h2 className="text-lg font-bold">{facility ? fa.facilities.edit : fa.facilities.addFacility}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        {error && <div className="mb-3 text-sm text-red-600 bg-red-50 rounded p-2">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{fa.facilities.code} *</label>
            <input
              type="text"
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{fa.facilities.nameFa} *</label>
            <input
              type="text"
              value={form.name_fa}
              onChange={e => setForm(f => ({ ...f, name_fa: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{fa.facilities.nameEn}</label>
            <input
              type="text"
              value={form.name_en}
              onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              dir="ltr"
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="fac_active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded" />
            <label htmlFor="fac_active" className="text-sm text-gray-700">{fa.facilities.isActive}</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={createFacility.isPending || updateFacility.isPending} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50">
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
