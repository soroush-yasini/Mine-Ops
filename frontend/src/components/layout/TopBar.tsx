import fa from '../../i18n/fa'
import { useTonnageUnit } from '../../hooks/useTonnageUnit'
import { Scale } from 'lucide-react'

export default function TopBar() {
  const { unit, toggle } = useTonnageUnit()

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0" dir="rtl">
      <div className="text-sm text-gray-500">{fa.app.title}</div>
      <button
        onClick={toggle}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 text-sm hover:bg-gray-50 transition-colors"
        title={fa.common.toggleUnit}
      >
        <Scale size={14} />
        <span>{unit === 'kg' ? 'نمایش به تن' : 'نمایش به کیلوگرم'}</span>
      </button>
    </header>
  )
}
