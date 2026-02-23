import { useState, useEffect } from 'react'
import { Autocomplete, TextField, CircularProgress } from '@mui/material'
import apiClient from '../../api/client'

interface Driver {
  id: number
  full_name: string
  phone: string
  is_active: boolean
}

interface DriverAutocompleteProps {
  value: number | null
  onChange: (id: number | null) => void
  label?: string
  required?: boolean
  error?: boolean
  helperText?: string
  disabled?: boolean
}

export default function DriverAutocomplete({
  value, onChange, label = 'راننده', required, error, helperText, disabled
}: DriverAutocompleteProps) {
  const [options, setOptions] = useState<Driver[]>([])
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    apiClient.get<{ items: Driver[] }>('/drivers', { params: { size: 100, is_active: true } })
      .then(res => { if (active) setOptions(res.data.items || []) })
      .catch(() => { if (active) setOptions([]) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const selected = options.find(d => d.id === value) || null

  return (
    <Autocomplete
      options={options}
      loading={loading}
      value={selected}
      inputValue={inputValue}
      onInputChange={(_, v) => setInputValue(v)}
      onChange={(_, v) => onChange(v ? v.id : null)}
      getOptionLabel={o => o.full_name}
      isOptionEqualToValue={(o, v) => o.id === v.id}
      disabled={disabled}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress size={18} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  )
}
