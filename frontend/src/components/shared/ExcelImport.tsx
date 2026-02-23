import { useState, useRef } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Table, TableHead, TableRow,
  TableCell, TableBody, Alert, CircularProgress, Chip,
} from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import readXlsxFile from 'read-excel-file'

interface ExcelImportProps {
  open: boolean
  onClose: () => void
  onImport: (rows: Record<string, unknown>[]) => Promise<{ success: number; errors: string[] }>
  columns: { key: string; label: string }[]
  title?: string
}

export default function ExcelImport({ open, onClose, onImport, columns, title = 'وارد کردن از Excel' }: ExcelImportProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [fileName, setFileName] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null)
  const [parseError, setParseError] = useState('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setResult(null)
    setParseError('')
    try {
      const rawRows = await readXlsxFile(file)
      if (rawRows.length < 2) {
        setParseError('فایل Excel خالی است یا فاقد ردیف داده است')
        return
      }
      // First row is headers; map subsequent rows to objects
      const headers = rawRows[0].map((h) => String(h ?? ''))
      const dataRows = rawRows.slice(1).map((row) => {
        const obj: Record<string, unknown> = {}
        headers.forEach((header, idx) => {
          obj[header] = row[idx] ?? ''
        })
        return obj
      })
      setRows(dataRows)
    } catch {
      setParseError('خطا در خواندن فایل Excel')
    }
  }

  const handleImport = async () => {
    setImporting(true)
    try {
      const res = await onImport(rows)
      setResult(res)
    } catch {
      setResult({ success: 0, errors: ['خطا در وارد کردن داده‌ها'] })
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setRows([])
    setFileName('')
    setResult(null)
    setParseError('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {!result && (
          <>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<UploadFileIcon />}
                onClick={() => inputRef.current?.click()}
              >
                انتخاب فایل Excel
              </Button>
              {fileName && <Typography variant="body2">{fileName}</Typography>}
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </Box>
            {parseError && <Alert severity="error" sx={{ mb: 2 }}>{parseError}</Alert>}
            {rows.length > 0 && (
              <>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {rows.length} ردیف پیدا شد
                </Typography>
                <Box sx={{ overflowX: 'auto', maxHeight: 400 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        {columns.map(col => (
                          <TableCell key={col.key}>{col.label}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.slice(0, 20).map((row, i) => (
                        <TableRow key={i}>
                          {columns.map(col => (
                            <TableCell key={col.key}>
                              {String(row[col.key] ?? '')}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
                {rows.length > 20 && (
                  <Typography variant="caption" color="text.secondary">
                    نمایش ۲۰ ردیف اول از {rows.length}
                  </Typography>
                )}
              </>
            )}
          </>
        )}
        {result && (
          <Box>
            <Alert severity={result.errors.length === 0 ? 'success' : 'warning'} sx={{ mb: 2 }}>
              {result.success} ردیف با موفقیت وارد شد
              {result.errors.length > 0 && ` - ${result.errors.length} خطا`}
            </Alert>
            {result.errors.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>خطاها:</Typography>
                {result.errors.map((err, i) => (
                  <Chip key={i} label={err} color="error" size="small" sx={{ m: 0.5 }} />
                ))}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          {result ? 'بستن' : 'انصراف'}
        </Button>
        {!result && rows.length > 0 && (
          <Button
            variant="contained"
            onClick={handleImport}
            disabled={importing}
            startIcon={importing ? <CircularProgress size={16} /> : undefined}
          >
            وارد کردن
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
