import { useState } from 'react'
import { useFinancialLedger, useUpdateInvestigation, useCreateLedgerEntry, useDeleteLedgerEntry, LedgerEntry } from '../../hooks/useFinancialLedger'
import { useFacilities } from '../../hooks/useFacilities'
import { formatJalali } from '../../lib/jalali'
import { formatCurrency } from '../../lib/utils'
import { TonnageCell } from '../../components/common/TonnageToggle'
import LedgerEntryForm from './LedgerEntryForm'
import fa from '../../i18n/fa'
import { Plus, Pencil, X, AlertTriangle } from 'lucide-react'

function InvestigationDrawer({ entry, onClose }: { entry: LedgerEntry; onClose: () => void }) {
  const [status, setStatus] = useState(entry.investigation_status)
  const [notes, setNotes] = useState(entry.investigation_notes || '')
  const updateInvestigation = useUpdateInvestigation()
  const [saved, setSaved] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateInvestigation.mutateAsync({ id: entry.id, investigation_notes: notes, investigation_status: status })
    setSaved(true)
    setTimeout(onClose, 800)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl" dir="rtl">
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-orange-500" />
            <h2 className="text-lg font-bold">بررسی اختلاف — ردیف #{entry.id}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-3 text-sm border-b bg-orange-50">
          <div><span className="font-medium">تاریخ: </span>{formatJalali(entry.date)}</div>
          <div><span className="font-medium">شرح: </span>{entry.description}</div>
          <div><span className="font-medium">اختلاف تناژ: </span>
            <span className="text-orange-700 font-semibold">{entry.tonnage_discrepancy_kg?.toLocaleString('fa-IR')} کگ</span>
          </div>
        </div>
        {saved && <div className="p-3 text-center text-green-600 text-sm">ذخیره شد ✓</div>}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{fa.financialLedger.investigationStatus}</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">{fa.financialLedger.pending}</option>
              <option value="investigating">{fa.financialLedger.investigating}</option>
              <option value="resolved">{fa.financialLedger.resolved}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{fa.financialLedger.investigationNotes}</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={updateInvestigation.isPending} className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium disabled:opacity-50">
              {fa.financialLedger.saveInvestigation}
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

export default function FinancialLedgerPage() {
  const { data: entries = [], isLoading } = useFinancialLedger()
  const { data: facilities = [] } = useFacilities()
  const deleteEntry = useDeleteLedgerEntry()
  const [showForm, setShowForm] = useState(false)
  const [investigatingEntry, setInvestigatingEntry] = useState<LedgerEntry | null>(null)
  const [facilityFilter, setFacilityFilter] = useState('')

  const facilityMap = Object.fromEntries(facilities.map(f => [f.id, f.name_fa]))

  const filteredEntries = facilityFilter
    ? entries.filter(e => String(e.facility_id) === facilityFilter)
    : entries

  const investigationStatusLabel: Record<string, string> = {
    pending: fa.financialLedger.pending,
    investigating: fa.financialLedger.investigating,
    resolved: fa.financialLedger.resolved,
  }

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{fa.financialLedger.title}</h1>
        <div className="flex gap-3 items-center">
          <select
            value={facilityFilter}
            onChange={e => setFacilityFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none"
          >
            <option value="">همه سایت‌ها</option>
            {facilities.map(f => <option key={f.id} value={f.id}>{f.name_fa}</option>)}
          </select>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus size={16} />
            {fa.financialLedger.addEntry}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">{fa.common.loading}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-gray-700">{fa.common.row}</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">{fa.financialLedger.date}</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">{fa.financialLedger.facility}</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">{fa.financialLedger.description}</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">{fa.financialLedger.debit}</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">{fa.financialLedger.credit}</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">{fa.financialLedger.balance}</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">{fa.financialLedger.tonnage}</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">{fa.financialLedger.discrepancy}</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">{fa.financialLedger.investigationStatus}</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">{fa.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-8 text-gray-400">{fa.common.noData}</td></tr>
              ) : filteredEntries.map(entry => (
                <tr
                  key={entry.id}
                  className={`border-b border-gray-100 transition-colors ${
                    entry.discrepancy_flag
                      ? entry.investigation_status === 'resolved'
                        ? 'bg-green-50 hover:bg-green-100'
                        : entry.investigation_status === 'investigating'
                          ? 'bg-blue-50 hover:bg-blue-100'
                          : 'bg-yellow-50 hover:bg-yellow-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-3">{entry.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatJalali(entry.date)}</td>
                  <td className="px-4 py-3">{facilityMap[entry.facility_id] || entry.facility_id}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate" title={entry.description}>{entry.description}</td>
                  <td className="px-4 py-3 text-red-600">{entry.debit ? formatCurrency(entry.debit) : '—'}</td>
                  <td className="px-4 py-3 text-green-600">{entry.credit ? formatCurrency(entry.credit) : '—'}</td>
                  <td className="px-4 py-3 font-medium">{entry.balance ? formatCurrency(entry.balance) : '—'}</td>
                  <td className="px-4 py-3"><TonnageCell valueKg={entry.ledger_tonnage_kg} /></td>
                  <td className="px-4 py-3">
                    {entry.discrepancy_flag ? (
                      <span className="flex items-center gap-1 text-orange-600 font-medium">
                        <AlertTriangle size={12} />
                        {entry.tonnage_discrepancy_kg?.toLocaleString('fa-IR')} کگ
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {entry.discrepancy_flag ? (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        entry.investigation_status === 'resolved' ? 'bg-green-100 text-green-700'
                        : entry.investigation_status === 'investigating' ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {investigationStatusLabel[entry.investigation_status] || entry.investigation_status}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {entry.discrepancy_flag && (
                        <button onClick={() => setInvestigatingEntry(entry)} className="p-1 text-orange-600 hover:bg-orange-50 rounded" title="بررسی اختلاف">
                          <AlertTriangle size={14} />
                        </button>
                      )}
                      <button onClick={() => { if (confirm('حذف شود؟')) deleteEntry.mutate(entry.id) }} className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <X size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && <LedgerEntryForm onClose={() => setShowForm(false)} />}
      {investigatingEntry && <InvestigationDrawer entry={investigatingEntry} onClose={() => setInvestigatingEntry(null)} />}
    </div>
  )
}
