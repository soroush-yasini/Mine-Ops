import jalaali from 'jalaali-js'

export function toJalali(gregorianDate: string | Date): string {
  const date = typeof gregorianDate === 'string' ? new Date(gregorianDate) : gregorianDate
  const { jy, jm, jd } = jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate())
  return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`
}

export function toGregorian(jalaliDate: string): string {
  const parts = jalaliDate.split('/')
  if (parts.length !== 3) return jalaliDate
  const { gy, gm, gd } = jalaali.toGregorian(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]))
  return `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`
}

export function formatJalali(gregorianDate: string | Date | null | undefined): string {
  if (!gregorianDate) return '—'
  try {
    return toJalali(gregorianDate)
  } catch {
    return String(gregorianDate)
  }
}

export function currentJalaliDate(): string {
  return toJalali(new Date())
}

export const JALALI_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
]
