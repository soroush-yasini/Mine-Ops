import { useState, useEffect } from 'react'
import { Autocomplete, TextField, CircularProgress } from '@mui/material'
import apiClient from '../../api/client'

interface Truck {
  id: number
  plate_number: string
  is_active: boolean
}

interface TruckAutocompleteProps {
  value: number | null
  onChange: (id: number | null) => void
  label?: string
  required?: boolean
  error?: boolean
  helperText?: string
  disabled?: boolean
}

export default function TruckAutocomplete({
  value, onChange, label = 'ماشین', required, error, helperText, disabled
}: TruckAutocompleteProps) {
  const [options, setOptions] = useState<Truck[]>([])
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    apiClient.get<{ items: Truck[] }>('/trucks', { params: { size: 100, is_active: true } })
      .then(res => { if (active) setOptions(res.data.items || []) })
      .catch(() => { if (active) setOptions([]) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const selected = options.find(t => t.id === value) || null

  return (
    <Autocomplete
      options={options}
      loading={loading}
      value={selected}
      inputValue={inputValue}
      onInputChange={(_, v) => setInputValue(v)}
      onChange={(_, v) => onChange(v ? v.id : null)}
      getOptionLabel={o => o.plate_number}
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
