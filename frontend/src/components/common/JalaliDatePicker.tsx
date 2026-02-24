import { useState } from 'react'
import { toGregorian, toJalali } from '../../lib/jalali'
import jalaali from 'jalaali-js'

interface JalaliDatePickerProps {
  value?: string  // Gregorian date string YYYY-MM-DD
  onChange: (gregorianDate: string) => void
  placeholder?: string
  className?: string
}

export default function JalaliDatePicker({ value, onChange, placeholder = 'انتخاب تاریخ (مثلاً ۱۴۰۳/۰۱/۱۵)', className }: JalaliDatePickerProps) {
  const [inputValue, setInputValue] = useState(value ? toJalali(value) : '')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setInputValue(raw)
    const cleaned = raw.replace(/-/g, '/')
    const parts = cleaned.split('/')
    if (parts.length === 3 && parts[0].length === 4) {
      const jy = parseInt(parts[0])
      const jm = parseInt(parts[1])
      const jd = parseInt(parts[2])
      if (!isNaN(jy) && !isNaN(jm) && !isNaN(jd) && jalaali.isValidJalaaliDate(jy, jm, jd)) {
        onChange(toGregorian(`${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`))
      }
    }
  }

  return (
    <input
      type="text"
      value={inputValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={`border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full ${className || ''}`}
      dir="ltr"
    />
  )
}
