import { useState } from 'react'
import { TextField, InputAdornment } from '@mui/material'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'

interface JalaliDatePickerProps {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  error?: boolean
  helperText?: string
  disabled?: boolean
}

function isValidJalali(str: string): boolean {
  if (!/^\d{4}\/\d{2}\/\d{2}$/.test(str)) return false
  const [y, m, d] = str.split('/').map(Number)
  if (m < 1 || m > 12) return false
  if (d < 1 || d > 31) return false
  if (m > 6 && d > 30) return false
  if (y < 1300 || y > 1500) return false
  return true
}

export default function JalaliDatePicker({
  label, value, onChange, required, error, helperText, disabled
}: JalaliDatePickerProps) {
  const [localError, setLocalError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    onChange(val)
    if (val && !isValidJalali(val)) {
      setLocalError('فرمت تاریخ صحیح نیست (مثال: ۱۴۰۳/۰۱/۱۵)')
    } else {
      setLocalError('')
    }
  }

  const showError = error || !!localError
  const showHelper = helperText || localError || 'فرمت: ۱۴۰۳/۰۱/۱۵'

  return (
    <TextField
      label={label}
      value={value}
      onChange={handleChange}
      required={required}
      error={showError}
      helperText={showHelper}
      disabled={disabled}
      placeholder="۱۴۰۳/۰۱/۱۵"
      inputProps={{ dir: 'ltr', style: { textAlign: 'left' } }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <CalendarMonthIcon fontSize="small" />
          </InputAdornment>
        ),
      }}
      fullWidth
    />
  )
}
