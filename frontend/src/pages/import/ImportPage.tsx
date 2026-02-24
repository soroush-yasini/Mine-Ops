import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Download, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../../lib/api'
import fa from '../../i18n/fa'

type TabKey = 'truck_trips' | 'bunker_trips' | 'lab_samples' | 'financial_ledger' | 'drivers'

const TABS: { key: TabKey; label: string; endpoint: string; template: string }[] = [
  { key: 'truck_trips', label: fa.import.truckTrips, endpoint: '/import/truck-trips', template: '/templates/truck_trips_template.csv' },
  { key: 'bunker_trips', label: fa.import.bunkerTrips, endpoint: '/import/bunker-trips', template: '/templates/bunker_trips_template.csv' },
  { key: 'lab_samples', label: fa.import.labSamples, endpoint: '/import/lab-samples', template: '/templates/lab_samples_template.csv' },
  { key: 'financial_ledger', label: fa.import.financialLedger, endpoint: '/import/financial-ledger', template: '/templates/financial_ledger_template.csv' },
  { key: 'drivers', label: fa.import.drivers, endpoint: '/import/drivers', template: '/templates/drivers_template.csv' },
]

interface ImportResult {
  total: number
  imported: number
  skipped: number
  errors: string[]
}

function ImportTab({ tab }: { tab: typeof TABS[number] }) {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      setResult(null)
      setError('')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  })

  const handleImport = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post<ImportResult>(tab.endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(data)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }; message?: string }
      setError(e.response?.data?.detail || e.message || 'خطا در وارد کردن داده')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">فایل CSV یا XLSX مطابق قالب نمونه آپلود کنید.</p>
        <a
          href={tab.template}
          download
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <Download size={14} />
          {fa.import.downloadTemplate}
        </a>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-3 text-gray-400" size={32} />
        <p className="text-sm text-gray-600 mb-1">
          {isDragActive ? 'رها کنید...' : fa.import.dropzone}
        </p>
        {file && (
          <p className="text-sm text-blue-600 font-medium mt-2">{file.name}</p>
        )}
      </div>

      {file && (
        <button
          onClick={handleImport}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="animate-spin text-lg">⏳</span>
          ) : (
            <Upload size={16} />
          )}
          {loading ? 'در حال وارد کردن...' : fa.import.importBtn}
        </button>
      )}

      {error && (
        <div className="flex items-start gap-2 text-red-600 bg-red-50 rounded-lg p-3 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="flex items-center gap-2 text-green-700 font-semibold mb-3">
            <CheckCircle size={18} />
            نتیجه وارد کردن
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-white rounded-lg p-3 text-center border border-green-100">
              <div className="text-2xl font-bold text-gray-800">{result.total}</div>
              <div className="text-gray-500">{fa.import.results.total}</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center border border-green-100">
              <div className="text-2xl font-bold text-green-600">{result.imported}</div>
              <div className="text-gray-500">{fa.import.results.imported}</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center border border-green-100">
              <div className="text-2xl font-bold text-yellow-600">{result.skipped}</div>
              <div className="text-gray-500">{fa.import.results.skipped}</div>
            </div>
          </div>
          {result.errors && result.errors.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-red-700 mb-1">{fa.import.results.errors}:</p>
              <ul className="text-xs text-red-600 space-y-0.5 max-h-32 overflow-y-auto">
                {result.errors.map((e, i) => <li key={i} className="bg-white rounded px-2 py-1 border border-red-100">{e}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('truck_trips')

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{fa.import.title}</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex border-b overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-6">
          {TABS.map(tab => (
            activeTab === tab.key && <ImportTab key={tab.key} tab={tab} />
          ))}
        </div>
      </div>
    </div>
  )
}
