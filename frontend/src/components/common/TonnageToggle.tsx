import { useTonnageUnit } from '../../hooks/useTonnageUnit'

export function TonnageCell({ valueKg }: { valueKg: number | null | undefined }) {
  const { unit } = useTonnageUnit()
  if (valueKg == null) return <span>—</span>
  if (unit === 'ton') {
    return <span>{(valueKg / 1000).toFixed(3)} تن</span>
  }
  return <span>{valueKg.toLocaleString('fa-IR')} کگ</span>
}
