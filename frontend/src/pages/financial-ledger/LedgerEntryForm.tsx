import { useState } from 'react'
import { useCreateLedgerEntry } from '../../hooks/useFinancialLedger'
import { useFacilities } from '../../hooks/useFacilities'
import JalaliDatePicker from '../../components/common/JalaliDatePicker'
import fa from '../../i18n/fa'
import { X } from 'lucide-react'

interface LedgerEntryFormProps {
  onClose: () => void
}

export default function LedgerEntryForm({ onClose }: LedgerEntryFormProps) {
  const { data: facilities = [] } = useFacilities()
  const [form, setForm] = useState({
    facility_id: 0,
    date: '',
    description: '',
    debit: null as number | null,
    credit: null as number | null,
    receipt_number: null as number | null,
    ledger_tonnage_kg: null as number | null,
    rate_per_ton: null as number | null,
    bunker_trip_id: null as number | null,
    investigation_notes: null as string | null,
    investigation_status: 'pending',
  })
  const createEntry = useCreateLedgerEntry()
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await createEntry.mutateAsync(form)
      onClose()
    } catch {
      setError('خطا در ذخیره‌سازی')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold">{fa.financialLedger.addEntry}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        {error && <div className="mx-6 mt-4 text-sm text-red-600 bg-red-50 rounded p-2">{error}</div>}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{fa.financialLedger.date} *</label>
              <JalaliDatePicker value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{fa.financialLedger.facility} *</label>
              <select
                value={form.facility_id || ''}
                onChange={e => setForm(f => ({ ...f, facility_id: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">— انتخاب —</option>
                {facilities.map(f => <option key={f.id} value={f.id}>{f.name_fa}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{fa.financialLedger.description} *</label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{fa.financialLedger.debit}</label>
              <input
                type="number"
                value={form.debit ?? ''}
                onChange={e => setForm(f => ({ ...f, debit: e.target.value ? Number(e.target.value) : null }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                dir="ltr" min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{fa.financialLedger.credit}</label>
              <input
                type="number"
                value={form.credit ?? ''}
                onChange={e => setForm(f => ({ ...f, credit: e.target.value ? Number(e.target.value) : null }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                dir="ltr" min="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{fa.financialLedger.receiptNumber}</label>
              <input
                type="number"
                value={form.receipt_number ?? ''}
                onChange={e => setForm(f => ({ ...f, receipt_number: e.target.value ? Number(e.target.value) : null }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{fa.financialLedger.tonnage} (کگ)</label>
              <input
                type="number"
                value={form.ledger_tonnage_kg ?? ''}
                onChange={e => setForm(f => ({ ...f, ledger_tonnage_kg: e.target.value ? Number(e.target.value) : null }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                dir="ltr" min="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{fa.financialLedger.ratePerTon}</label>
            <input
              type="number"
              value={form.rate_per_ton ?? ''}
              onChange={e => setForm(f => ({ ...f, rate_per_ton: e.target.value ? Number(e.target.value) : null }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              dir="ltr" min="0"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={createEntry.isPending} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50">
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
