import { useState, useEffect } from 'react'
import {
  Box, TextField, Button, Typography, Autocomplete, CircularProgress,
} from '@mui/material'
import { getSampleTypes, type SampleType } from '../../api/sample_types'
import { createLabAssay, type LabAssayCreate } from '../../api/lab_assays'
import JalaliDatePicker from '../../components/shared/JalaliDatePicker'

interface AssayFormProps {
  batchId: number
  onAdded: () => void
}

function parseSampleCode(code: string): { facility: string; date: string; sampleTypeCode: string } {
  // Expected format: FACILITY-DATE-TYPE (e.g., LAB01-14030115-CY)
  const parts = code.split('-')
  if (parts.length >= 3) {
    return {
      facility: parts[0],
      date: parts[1],
      sampleTypeCode: parts[2],
    }
  }
  return { facility: '', date: '', sampleTypeCode: '' }
}

export default function AssayForm({ batchId, onAdded }: AssayFormProps) {
  const [sampleTypes, setSampleTypes] = useState<SampleType[]>([])
  const [loadingTypes, setLoadingTypes] = useState(false)
  const [sampleCode, setSampleCode] = useState('')
  const [facility, setFacility] = useState('')
  const [date, setDate] = useState('')
  const [sampleType, setSampleType] = useState<SampleType | null>(null)
  const [auPpm, setAuPpm] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoadingTypes(true)
    getSampleTypes({ size: 100 })
      .then(d => setSampleTypes(d.items))
      .catch(() => {})
      .finally(() => setLoadingTypes(false))
  }, [])

  const handleCodeChange = (code: string) => {
    setSampleCode(code)
    if (code.length > 5) {
      const parsed = parseSampleCode(code)
      if (parsed.facility) setFacility(parsed.facility)
      if (parsed.date) setDate(parsed.date)
      if (parsed.sampleTypeCode) {
        const found = sampleTypes.find(t => t.code === parsed.sampleTypeCode)
        if (found) setSampleType(found)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sampleCode || !sampleType || !auPpm) {
      setError('کد نمونه، نوع نمونه و مقدار Au الزامی است')
      return
    }
    setSaving(true)
    setError('')
    try {
      const data: LabAssayCreate = {
        batch_id: batchId,
        sample_code: sampleCode,
        facility,
        date,
        sample_type_id: sampleType.id,
        au_ppm: parseFloat(auPpm),
      }
      await createLabAssay(data)
      setSampleCode('')
      setFacility('')
      setDate('')
      setSampleType(null)
      setAuPpm('')
      onAdded()
    } catch {
      setError('خطا در افزودن آنالیز')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
      <Typography variant="subtitle1" fontWeight={600} mb={2}>افزودن آنالیز جدید</Typography>
      {error && <Typography color="error" variant="body2" mb={1}>{error}</Typography>}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2 }}>
        <TextField
          label="کد نمونه"
          value={sampleCode}
          onChange={e => handleCodeChange(e.target.value)}
          required
          size="small"
          placeholder="LAB01-14030115-CY"
          inputProps={{ dir: 'ltr' }}
          helperText="فرمت: محل-تاریخ-نوع"
        />
        <TextField
          label="محل آزمایش"
          value={facility}
          onChange={e => setFacility(e.target.value)}
          size="small"
          inputProps={{ dir: 'ltr' }}
        />
        <JalaliDatePicker
          label="تاریخ نمونه"
          value={date}
          onChange={setDate}
        />
        <Autocomplete
          options={sampleTypes}
          loading={loadingTypes}
          value={sampleType}
          onChange={(_, v) => setSampleType(v)}
          getOptionLabel={o => `${o.name} (${o.code})`}
          isOptionEqualToValue={(o, v) => o.id === v.id}
          size="small"
          renderInput={params => (
            <TextField
              {...params}
              label="نوع نمونه"
              required
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingTypes && <CircularProgress size={16} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
        <TextField
          label="Au (ppm)"
          value={auPpm}
          onChange={e => setAuPpm(e.target.value)}
          required
          size="small"
          type="number"
          inputProps={{ dir: 'ltr', step: '0.001' }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={saving}
          sx={{ alignSelf: 'flex-start', mt: 1 }}
        >
          افزودن
        </Button>
      </Box>
    </Box>
  )
}
