import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Skeleton, Snackbar, Alert, TablePagination,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { useAuth } from '../../context/AuthContext'
import { getLabBatches, createLabBatch, deleteLabBatch, type LabBatch, type LabBatchCreate } from '../../api/lab_batches'
import JalaliDatePicker from '../../components/shared/JalaliDatePicker'

const emptyForm: LabBatchCreate = { issue_date: '', description: '' }

export default function BatchList() {
  const { isManager } = useAuth()
  const navigate = useNavigate()
  const [batches, setBatches] = useState<LabBatch[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<LabBatchCreate>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' })

  const fetchBatches = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getLabBatches({ page: page + 1, size: rowsPerPage })
      setBatches(data.items)
      setTotal(data.total)
    } catch {
      showSnackbar('خطا در بارگذاری', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, rowsPerPage])

  useEffect(() => { fetchBatches() }, [fetchBatches])

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleAdd = () => { setForm(emptyForm); setDialogOpen(true) }

  const handleSave = async () => {
    if (!form.issue_date) return
    setSaving(true)
    try {
      await createLabBatch(form)
      showSnackbar('دسته با موفقیت اضافه شد', 'success')
      setDialogOpen(false)
      fetchBatches()
    } catch {
      showSnackbar('خطا در ذخیره‌سازی', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteLabBatch(deleteId)
      showSnackbar('دسته حذف شد', 'success')
      setDeleteId(null)
      fetchBatches()
    } catch {
      showSnackbar('خطا در حذف', 'error')
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>دسته‌های آنالیز آزمایشگاه</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>افزودن دسته</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>تاریخ صدور</TableCell>
              <TableCell align="right">تعداد نمونه</TableCell>
              <TableCell align="right">هزینه کل</TableCell>
              <TableCell>توضیحات</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: rowsPerPage }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
              ))
            ) : batches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center"><Typography color="text.secondary" py={3}>داده‌ای یافت نشد</Typography></TableCell>
              </TableRow>
            ) : (
              batches.map(batch => (
                <TableRow key={batch.id} hover>
                  <TableCell dir="ltr">{batch.issue_date}</TableCell>
                  <TableCell align="right">{batch.sample_count}</TableCell>
                  <TableCell align="right">{batch.total_cost?.toLocaleString()}</TableCell>
                  <TableCell>{batch.description || '—'}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => navigate(`/lab/batches/${batch.id}`)} color="primary" title="مشاهده جزئیات">
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                    {isManager && (
                      <IconButton size="small" onClick={() => setDeleteId(batch.id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
                    )}
                  </TableCell>
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>افزودن دسته جدید</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <JalaliDatePicker label="تاریخ صدور" value={form.issue_date} onChange={v => setForm(f => ({ ...f, issue_date: v }))} required />
          <TextField
            label="توضیحات" value={form.description || ''}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            fullWidth multiline rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.issue_date}>ذخیره</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>تأیید حذف</DialogTitle>
        <DialogContent><Typography>آیا از حذف این دسته مطمئن هستید؟</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>انصراف</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>حذف</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}
