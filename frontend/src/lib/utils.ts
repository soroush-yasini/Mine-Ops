import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number | null | undefined): string {
  if (n == null) return '—'
  return n.toLocaleString('fa-IR')
}

export function formatCurrency(n: number | null | undefined): string {
  if (n == null) return '—'
  return `${n.toLocaleString('fa-IR')} ریال`
}

export function formatTonnage(kg: number | null | undefined, unit: 'kg' | 'ton'): string {
  if (kg == null) return '—'
  if (unit === 'ton') {
    return `${(kg / 1000).toFixed(3)} تن`
  }
  return `${kg.toLocaleString('fa-IR')} کگ`
}
