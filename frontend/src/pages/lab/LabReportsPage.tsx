import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import DataTable from '../../components/common/DataTable'
import { useLabReports, useCreateLabSample, useDeleteLabReport, LabReport, LabSample } from '../../hooks/useLabReports'
import { useFacilities } from '../../hooks/useFacilities'
import LabReportForm from './LabReportForm'
import StatusBadge from '../../components/common/StatusBadge'
import { formatJalali } from '../../lib/jalali'
import { formatCurrency } from '../../lib/utils'
import { Pencil, Trash2, Plus, ChevronDown, ChevronUp, FlaskConical } from 'lucide-react'
import fa from '../../i18n/fa'

function SamplesSubTable({ samples }: { samples: LabSample[] }) {
  return (
    <div className="bg-gray-50 border-t border-gray-200 p-4">
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-xs">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-right font-medium text-gray-600">{fa.lab.rawCode}</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">{fa.lab.facilityCode}</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">{fa.lab.year}/{fa.lab.month}/{fa.lab.day}</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">{fa.lab.sampleType}</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">{fa.lab.sampleIndex}</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">{fa.lab.auPpm}</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">{fa.lab.thresholdFlag}</th>
            </tr>
          </thead>
          <tbody>
            {samples.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-4 text-gray-400">{fa.common.noData}</td></tr>
            ) : samples.map(s => (
              <tr key={s.id} className="border-b border-gray-100 hover:bg-white">
                <td className="px-3 py-2 font-mono">{s.raw_code}</td>
                <td className="px-3 py-2">{s.facility_code || '—'}</td>
                <td className="px-3 py-2 dir-ltr">{s.year ? `${s.year}/${s.month}/${s.day}` : '—'}</td>
                <td className="px-3 py-2">{s.sample_type || '—'}</td>
                <td className="px-3 py-2">{s.sample_index ?? '—'}</td>
                <td className="px-3 py-2 font-semibold">{s.au_ppm}</td>
                <td className="px-3 py-2">
                  <StatusBadge variant={s.threshold_flag || 'normal'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AddSampleInline({ reportId }: { reportId: number }) {
  const [rawCode, setRawCode] = useState('')
  const [auPpm, setAuPpm] = useState('')
  const [open, setOpen] = useState(false)
  const addSample = useCreateLabSample()

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    await addSample.mutateAsync({ reportId, raw_code: rawCode, au_ppm: Number(auPpm) })
    setRawCode('')
    setAuPpm('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button onClick={(e) => { e.stopPropagation(); setOpen(true) }} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 px-2 py-1">
        <Plus size={12} />
        {fa.lab.addSample}
      </button>
    )
  }

  return (
    <form onSubmit={handleAdd} className="flex gap-2 items-center p-3" onClick={e => e.stopPropagation()}>
      <input
        type="text"
        placeholder={fa.lab.rawCode}
        value={rawCode}
        onChange={e => setRawCode(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-xs w-40"
        required
      />
      <input
        type="number"
        placeholder={fa.lab.auPpm}
        value={auPpm}
        onChange={e => setAuPpm(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-xs w-24"
        required step="0.001" dir="ltr"
      />
      <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">{fa.common.add}</button>
      <button type="button" onClick={(e) => { e.stopPropagation(); setOpen(false) }} className="text-gray-500 px-2 py-1 text-xs hover:text-gray-700">{fa.common.cancel}</button>
    </form>
  )
}

export default function LabReportsPage() {
  const { data: reports = [], isLoading } = useLabReports()
  const { data: facilities = [] } = useFacilities()
  const deleteReport = useDeleteLabReport()
  const [editingReport, setEditingReport] = useState<LabReport | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const facilityMap = Object.fromEntries(facilities.map(f => [f.id, f.name_fa]))

  const toggleExpand = (id: number) => setExpandedId(prev => prev === id ? null : id)

  const columns: ColumnDef<LabReport>[] = [
    {
      id: 'expand',
      header: '',
      size: 40,
      cell: ({ row }) => (
        <button onClick={() => toggleExpand(row.original.id)} className="p-1 text-gray-500 hover:text-gray-700">
          {expandedId === row.original.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      )
    },
    { accessorKey: 'id', header: fa.common.row, size: 60 },
    { accessorKey: 'issue_date', header: fa.lab.issueDate, cell: ({ getValue }) => formatJalali(getValue() as string) },
    { id: 'facility', header: fa.lab.facility, cell: ({ row }) => facilityMap[row.original.facility_id] || row.original.facility_id },
    { accessorKey: 'sample_count', header: fa.lab.sampleCount, cell: ({ getValue }) => (
      <span className="flex items-center gap-1"><FlaskConical size={12} className="text-purple-500" />{getValue() as number}</span>
    )},
    { accessorKey: 'total_cost', header: fa.lab.totalCost, cell: ({ getValue }) => formatCurrency(getValue() as number | null) },
    { accessorKey: 'notes', header: fa.lab.notes, cell: ({ getValue }) => (getValue() as string) || '—' },
    {
      id: 'pdf',
      header: 'PDF',
      cell: ({ row }) => row.original.report_pdf
        ? <a href={row.original.report_pdf} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline" onClick={e => e.stopPropagation()}>دانلود</a>
        : '—'
    },
    {
      id: 'actions',
      header: fa.common.actions,
      cell: ({ row }) => (
        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          <button onClick={() => { setEditingReport(row.original); setShowForm(true) }} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
            <Pencil size={14} />
          </button>
          <button onClick={() => { if (confirm('حذف شود؟')) deleteReport.mutate(row.original.id) }} className="p-1 text-red-600 hover:bg-red-50 rounded">
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ]

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{fa.lab.title}</h1>
        <button
          onClick={() => { setEditingReport(null); setShowForm(true) }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus size={16} />
          {fa.lab.addReport}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">{fa.common.loading}</div>
        ) : (
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {columns.map(col => (
                    <th key={col.id as string} className="px-4 py-3 text-right font-medium text-gray-700 whitespace-nowrap">
                      {typeof col.header === 'string' ? col.header : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr><td colSpan={columns.length} className="text-center py-8 text-gray-400">{fa.common.noData}</td></tr>
                ) : reports.map(report => (
                  <>
                    <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpand(report.id)}>
                      <td className="px-4 py-3">
                        <button className="p-1 text-gray-500 hover:text-gray-700">
                          {expandedId === report.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </td>
                      <td className="px-4 py-3">{report.id}</td>
                      <td className="px-4 py-3">{formatJalali(report.issue_date)}</td>
                      <td className="px-4 py-3">{facilityMap[report.facility_id] || report.facility_id}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1"><FlaskConical size={12} className="text-purple-500" />{report.sample_count}</span>
                      </td>
                      <td className="px-4 py-3">{formatCurrency(report.total_cost)}</td>
                      <td className="px-4 py-3">{report.notes || '—'}</td>
                      <td className="px-4 py-3">
                        {report.report_pdf
                          ? <a href={report.report_pdf} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline" onClick={e => e.stopPropagation()}>دانلود</a>
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                          <button onClick={() => { setEditingReport(report); setShowForm(true) }} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => { if (confirm('حذف شود؟')) deleteReport.mutate(report.id) }} className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === report.id && (
                      <tr key={`${report.id}-samples`}>
                        <td colSpan={columns.length} className="p-0">
                          <SamplesSubTable samples={report.samples || []} />
                          <AddSampleInline reportId={report.id} />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <LabReportForm report={editingReport} onClose={() => setShowForm(false)} />
      )}
    </div>
  )
}
