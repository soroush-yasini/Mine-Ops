import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Skeleton, Snackbar, Alert,
  TablePagination, Card, CardContent, Divider,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import UploadIcon from '@mui/icons-material/Upload'
import { useAuth } from '../../context/AuthContext'
import { getLabBatch, type LabBatch } from '../../api/lab_batches'
import { getLabAssays, deleteLabAssay, importLabAssays, type LabAssay } from '../../api/lab_assays'
import AssayForm from './AssayForm'
import ExcelImport from '../../components/shared/ExcelImport'

const EXCEL_COLS = [
  { key: 'sample_code', label: 'کد نمونه' },
  { key: 'facility', label: 'محل آزمایش' },
  { key: 'date', label: 'تاریخ' },
  { key: 'sample_type_code', label: 'کد نوع نمونه' },
  { key: 'au_ppm', label: 'Au (ppm)' },
]

export default function BatchDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isManager } = useAuth()
  const [batch, setBatch] = useState<LabBatch | null>(null)
  const [assays, setAssays] = useState<LabAssay[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [loading, setLoading] = useState(true)
  const [excelOpen, setExcelOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' })

  const batchId = parseInt(id || '0')

  useEffect(() => {
    if (batchId) {
      getLabBatch(batchId).then(setBatch).catch(() => {})
    }
  }, [batchId])

  const fetchAssays = useCallback(async () => {
    if (!batchId) return
    setLoading(true)
    try {
      const data = await getLabAssays(batchId, { page: page + 1, size: rowsPerPage })
      setAssays(data.items)
      setTotal(data.total)
    } catch {
      setSnackbar({ open: true, message: 'خطا در بارگذاری', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }, [batchId, page, rowsPerPage])

  useEffect(() => { fetchAssays() }, [fetchAssays])

  const handleDelete = async (assayId: number) => {
    try {
      await deleteLabAssay(assayId)
      setSnackbar({ open: true, message: 'آنالیز حذف شد', severity: 'success' })
      fetchAssays()
    } catch {
      setSnackbar({ open: true, message: 'خطا در حذف', severity: 'error' })
    }
    setDeleteId(null)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate('/lab/batches')}><ArrowBackIcon /></IconButton>
        <Typography variant="h5" fontWeight={700}>جزئیات دسته آنالیز</Typography>
      </Box>

      {batch && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">تاریخ صدور</Typography>
                <Typography fontWeight={600} dir="ltr">{batch.issue_date}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">تعداد نمونه</Typography>
                <Typography fontWeight={600}>{batch.sample_count}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">هزینه کل</Typography>
                <Typography fontWeight={600}>{batch.total_cost?.toLocaleString()}</Typography>
              </Box>
              {batch.description && (
                <Box>
                  <Typography variant="caption" color="text.secondary">توضیحات</Typography>
                  <Typography>{batch.description}</Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      <AssayForm batchId={batchId} onAdded={fetchAssays} />

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">آنالیزها ({total})</Typography>
        <Button variant="outlined" startIcon={<UploadIcon />} onClick={() => setExcelOpen(true)}>
          وارد کردن Excel
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>کد نمونه</TableCell>
              <TableCell>محل آزمایش</TableCell>
              <TableCell>تاریخ</TableCell>
              <TableCell>نوع نمونه</TableCell>
              <TableCell align="right">Au (ppm)</TableCell>
              {isManager && <TableCell align="center">عملیات</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
              ))
            ) : assays.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary" py={3}>هنوز آنالیزی اضافه نشده</Typography>
                </TableCell>
              </TableRow>
            ) : (
              assays.map(assay => (
                <TableRow key={assay.id} hover>
                  <TableCell dir="ltr" sx={{ fontFamily: 'monospace' }}>{assay.sample_code}</TableCell>
                  <TableCell dir="ltr">{assay.facility}</TableCell>
                  <TableCell dir="ltr">{assay.date}</TableCell>
                  <TableCell>{assay.sample_type?.name}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{assay.au_ppm}</TableCell>
                  {isManager && (
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleDelete(assay.id)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div" count={total} page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value)); setPage(0) }}
          labelRowsPerPage="ردیف در صفحه:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} از ${count}`}
        />
      </TableContainer>

      <ExcelImport
        open={excelOpen}
        onClose={() => setExcelOpen(false)}
        onImport={rows => importLabAssays(batchId, rows)}
        columns={EXCEL_COLS}
        title="وارد کردن آنالیزها"
      />

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}
