import { useState } from 'react'
import { useCreateLabReport, LabReport } from '../../hooks/useLabReports'
import { useFacilities } from '../../hooks/useFacilities'
import JalaliDatePicker from '../../components/common/JalaliDatePicker'
import FileUpload from '../../components/common/FileUpload'
import fa from '../../i18n/fa'
import { X } from 'lucide-react'

interface LabReportFormProps {
  report: LabReport | null
  onClose: () => void
}

export default function LabReportForm({ report, onClose }: LabReportFormProps) {
  const { data: facilities = [] } = useFacilities()
  const [form, setForm] = useState({
    issue_date: report?.issue_date || '',
    facility_id: report?.facility_id || 0,
    report_pdf: report?.report_pdf || null,
    total_cost: report?.total_cost ?? null,
    notes: report?.notes || '',
  })
  const createReport = useCreateLabReport()
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await createReport.mutateAsync(form)
      onClose()
    } catch {
      setError('خطا در ذخیره‌سازی')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold">{report ? 'ویرایش گزارش' : fa.lab.addReport}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        {error && <div className="mx-6 mt-4 text-sm text-red-600 bg-red-50 rounded p-2">{error}</div>}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{fa.lab.issueDate} *</label>
            <JalaliDatePicker value={form.issue_date} onChange={v => setForm(f => ({ ...f, issue_date: v }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{fa.lab.facility} *</label>
            <select
              value={form.facility_id || ''}
              onChange={e => setForm(f => ({ ...f, facility_id: Number(e.target.value) }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">— انتخاب سایت —</option>
              {facilities.filter(f => f.is_active).map(f => (
                <option key={f.id} value={f.id}>{f.name_fa} ({f.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{fa.lab.totalCost}</label>
            <input
              type="number"
              value={form.total_cost ?? ''}
              onChange={e => setForm(f => ({ ...f, total_cost: e.target.value ? Number(e.target.value) : null }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{fa.lab.notes}</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{fa.lab.reportPdf}</label>
            <FileUpload
              type="pdf"
              currentUrl={form.report_pdf}
              onUpload={(url) => setForm(f => ({ ...f, report_pdf: url }))}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={createReport.isPending} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50">
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
