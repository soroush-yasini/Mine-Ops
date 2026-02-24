import { cn } from '../../lib/utils'

type BadgeVariant = 'paid' | 'unpaid' | 'initialized' | 'normal' | 'high' | 'low' | 'alert' | 'pending' | 'investigating' | 'resolved'

const variants: Record<BadgeVariant, string> = {
  paid: 'bg-green-100 text-green-800',
  unpaid: 'bg-red-100 text-red-800',
  initialized: 'bg-yellow-100 text-yellow-800',
  normal: 'bg-green-100 text-green-800',
  high: 'bg-orange-100 text-orange-800',
  low: 'bg-blue-100 text-blue-800',
  alert: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
  investigating: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
}

const icons: Record<BadgeVariant, string> = {
  paid: '🟢',
  unpaid: '🔴',
  initialized: '🟡',
  normal: '🟢',
  high: '🟠',
  low: '🔵',
  alert: '🚨',
  pending: '🟡',
  investigating: '🔵',
  resolved: '🟢',
}

const labels: Record<string, string> = {
  paid: 'پرداخت شده',
  unpaid: 'پرداخت نشده',
  initialized: 'در انتظار پرداخت',
  normal: 'نرمال',
  high: 'بالا',
  low: 'پایین',
  alert: 'هشدار',
  pending: 'در انتظار',
  investigating: 'در حال بررسی',
  resolved: 'رفع شده',
}

interface StatusBadgeProps {
  variant: string
  label?: string
}

export default function StatusBadge({ variant, label }: StatusBadgeProps) {
  const v = (variant in variants ? variant : 'normal') as BadgeVariant
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', variants[v])}>
      <span>{icons[v]}</span>
      {label || labels[variant] || variant}
    </span>
  )
}
