import { useState } from 'react'
import axios from 'axios'
import { useCreateBunkerTrip, useUpdateBunkerTrip, usePayBunkerTrip, BunkerTrip } from '../../hooks/useBunkerTrips'
import { useTrucks } from '../../hooks/useTrucks'
import { useDrivers } from '../../hooks/useDrivers'
import { useFacilities } from '../../hooks/useFacilities'
import JalaliDatePicker from '../../components/common/JalaliDatePicker'
import FileUpload from '../../components/common/FileUpload'
import StatusBadge from '../../components/common/StatusBadge'
import fa from '../../i18n/fa'
import { X } from 'lucide-react'

interface BunkerTripFormProps {
  trip: BunkerTrip | null
  paymentMode: boolean
  onClose: () => void
}

export default function BunkerTripForm({ trip, paymentMode, onClose }: BunkerTripFormProps) {
  const { data: trucks = [] } = useTrucks()
  const { data: drivers = [] } = useDrivers()
  const { data: facilities = [] } = useFacilities()

  const [form, setForm] = useState({
    date: trip?.date || '',
    time: trip?.time || '',
    truck_id: trip?.truck_id || 0,
    driver_id: trip?.driver_id || 0,
    receipt_number: trip?.receipt_number || 0,
    tonnage_kg: trip?.tonnage_kg || 0,
    origin_facility_id: trip?.origin_facility_id || 0,
    freight_rate_per_ton: trip?.freight_rate_per_ton || 0,
    recorded_total_amount: trip?.recorded_total_amount ?? null,
    notes: trip?.notes || '',
    payment_date: trip?.payment_date || '',
    payment_notes: trip?.payment_notes || '',
    payment_receipt_image: trip?.payment_receipt_image || null,
  })

  const createTrip = useCreateBunkerTrip()
  const updateTrip = useUpdateBunkerTrip()
  const payTrip = usePayBunkerTrip()
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'phase1' | 'phase2'>(paymentMode ? 'phase2' : 'phase1')

  const isEditing = !!trip

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (activeTab === 'phase2' && trip) {
        await payTrip.mutateAsync({
          id: trip.id,
          payment_date: form.payment_date,
          payment_notes: form.payment_notes,
          payment_receipt_image: form.payment_receipt_image || undefined,
        })
      } else if (isEditing && trip) {
        await updateTrip.mutateAsync({ ...trip, ...form })
      } else {
        await createTrip.mutateAsync({
          date: form.date,
          time: form.time || null,
          truck_id: form.truck_id,
          driver_id: form.driver_id,
          receipt_number: form.receipt_number,
          tonnage_kg: form.tonnage_kg,
          origin_facility_id: form.origin_facility_id,
          freight_rate_per_ton: form.freight_rate_per_ton,
          recorded_total_amount: form.recorded_total_amount,
          notes: form.notes || null,
          payment_date: null,
          payment_receipt_image: null,
          payment_notes: null,
        })
      }
      onClose()
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setError(err.response.data?.detail || 'شماره قبض تکراری است')
      } else {
        setError('خطا در ذخیره‌سازی')
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold">{isEditing ? 'ویرایش سفر بونکر' : fa.bunkerTrips.addTrip}</h2>
            {trip && <StatusBadge variant={trip.status || (trip.is_paid ? 'paid' : 'initialized')} />}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        {isEditing && (
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('phase1')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'phase1' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {fa.truckTrips.phase1}
            </button>
            <button
              onClick={() => setActiveTab('phase2')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'phase2' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {fa.truckTrips.phase2}
            </button>
          </div>
        )}

        {error && <div className="mx-6 mt-4 text-sm text-red-600 bg-red-50 rounded p-2">{error}</div>}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {activeTab === 'phase1' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{fa.bunkerTrips.date} *</label>
                  <JalaliDatePicker value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{fa.bunkerTrips.time}</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{fa.bunkerTrips.truck} *</label>
                  <select
                    value={form.truck_id || ''}
                    onChange={e => {
                      const truckId = Number(e.target.value)
                      const truck = trucks.find(t => t.id === truckId)
                      setForm(f => ({ ...f, truck_id: truckId, driver_id: truck?.default_driver_id || f.driver_id }))
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">— انتخاب —</option>
                    {trucks.filter(t => t.is_active).map(t => (
                      <option key={t.id} value={t.id}>{t.plate_number}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{fa.bunkerTrips.driver} *</label>
                  <select
                    value={form.driver_id || ''}
                    onChange={e => setForm(f => ({ ...f, driver_id: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">— انتخاب —</option>
                    {drivers.filter(d => d.is_active).map(d => (
                      <option key={d.id} value={d.id}>{d.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{fa.bunkerTrips.receiptNumber} *</label>
                  <input
                    type="number"
                    value={form.receipt_number || ''}
                    onChange={e => setForm(f => ({ ...f, receipt_number: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{fa.bunkerTrips.tonnage} *</label>
                  <input
                    type="number"
                    value={form.tonnage_kg || ''}
                    onChange={e => setForm(f => ({ ...f, tonnage_kg: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required dir="ltr" min="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{fa.bunkerTrips.origin} *</label>
                  <select
                    value={form.origin_facility_id || ''}
                    onChange={e => setForm(f => ({ ...f, origin_facility_id: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">— انتخاب —</option>
                    {facilities.filter(f => f.is_active).map(f => (
                      <option key={f.id} value={f.id}>{f.name_fa}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{fa.bunkerTrips.freightRate} *</label>
                  <input
                    type="number"
                    value={form.freight_rate_per_ton || ''}
                    onChange={e => setForm(f => ({ ...f, freight_rate_per_ton: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required dir="ltr" min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{fa.bunkerTrips.recordedAmount}</label>
                <input
                  type="number"
                  value={form.recorded_total_amount ?? ''}
                  onChange={e => setForm(f => ({ ...f, recorded_total_amount: e.target.value ? Number(e.target.value) : null }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{fa.bunkerTrips.notes}</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {activeTab === 'phase2' && (
            <>
              {trip && (
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 space-y-1">
                  <div><span className="font-medium">تاریخ: </span>{new Date(trip.date).toLocaleDateString('fa-IR')}</div>
                  <div><span className="font-medium">تناژ: </span>{trip.tonnage_kg.toLocaleString('fa-IR')} کگ</div>
                  {trip.tonnage_discrepancy_kg !== null && trip.tonnage_discrepancy_kg !== 0 && (
                    <div className="text-orange-600"><span className="font-medium">اختلاف: </span>{trip.tonnage_discrepancy_kg.toLocaleString('fa-IR')} کگ</div>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{fa.bunkerTrips.paymentDate} *</label>
                <JalaliDatePicker value={form.payment_date} onChange={v => setForm(f => ({ ...f, payment_date: v }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{fa.bunkerTrips.paymentNotes}</label>
                <textarea
                  value={form.payment_notes}
                  onChange={e => setForm(f => ({ ...f, payment_notes: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{fa.bunkerTrips.paymentReceipt}</label>
                <FileUpload
                  type="image"
                  currentUrl={form.payment_receipt_image}
                  onUpload={(url) => setForm(f => ({ ...f, payment_receipt_image: url }))}
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={createTrip.isPending || updateTrip.isPending || payTrip.isPending}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {activeTab === 'phase2' ? fa.bunkerTrips.registerPayment : fa.common.save}
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
