import { useState, useEffect } from 'react'
import { Autocomplete, TextField, CircularProgress } from '@mui/material'
import apiClient from '../../api/client'

interface GrindingSite {
  id: number
  code: string
  name_fa: string
  name_en: string
  is_active: boolean
}

interface SiteAutocompleteProps {
  value: number | null
  onChange: (id: number | null) => void
  label?: string
  required?: boolean
  error?: boolean
  helperText?: string
  disabled?: boolean
}

export default function SiteAutocomplete({
  value, onChange, label = 'سایت آسیاب', required, error, helperText, disabled
}: SiteAutocompleteProps) {
  const [options, setOptions] = useState<GrindingSite[]>([])
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    apiClient.get<{ items: GrindingSite[] }>('/grinding-sites', { params: { size: 100, is_active: true } })
      .then(res => { if (active) setOptions(res.data.items || []) })
      .catch(() => { if (active) setOptions([]) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const selected = options.find(s => s.id === value) || null

  return (
    <Autocomplete
      options={options}
      loading={loading}
      value={selected}
      inputValue={inputValue}
      onInputChange={(_, v) => setInputValue(v)}
      onChange={(_, v) => onChange(v ? v.id : null)}
      getOptionLabel={o => `${o.name_fa} (${o.code})`}
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
