import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Switch, FormControlLabel,
  Skeleton, Snackbar, Alert, TablePagination,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  getSampleTypes, createSampleType, updateSampleType, deleteSampleType,
  type SampleType, type SampleTypeCreate,
} from '../../api/sample_types'

const emptyForm: SampleTypeCreate = { name: '', code: '', description: '', is_active: true }

export default function SampleTypeList() {
  const [items, setItems] = useState<SampleType[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<SampleTypeCreate>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' })

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getSampleTypes({ page: page + 1, size: rowsPerPage })
      setItems(data.items)
      setTotal(data.total)
    } catch {
      showSnackbar('خطا در بارگذاری', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, rowsPerPage])

  useEffect(() => { fetchItems() }, [fetchItems])

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleAdd = () => { setForm(emptyForm); setEditingId(null); setDialogOpen(true) }

  const handleEdit = (item: SampleType) => {
    setForm({ name: item.name, code: item.code, description: item.description, is_active: item.is_active })
    setEditingId(item.id)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.code) return
    setSaving(true)
    try {
      if (editingId) {
        await updateSampleType(editingId, form)
        showSnackbar('ویرایش شد', 'success')
      } else {
        await createSampleType(form)
        showSnackbar('اضافه شد', 'success')
      }
      setDialogOpen(false)
      fetchItems()
    } catch {
      showSnackbar('خطا در ذخیره‌سازی', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteSampleType(deleteId)
      showSnackbar('حذف شد', 'success')
      setDeleteId(null)
      fetchItems()
    } catch {
      showSnackbar('خطا در حذف', 'error')
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>انواع نمونه</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>افزودن</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>نام</TableCell>
              <TableCell>کد</TableCell>
              <TableCell>توضیحات</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: rowsPerPage }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center"><Typography color="text.secondary" py={3}>داده‌ای یافت نشد</Typography></TableCell>
              </TableRow>
            ) : (
              items.map(item => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.name}</TableCell>
                  <TableCell dir="ltr" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.code}</TableCell>
                  <TableCell>{item.description || '—'}</TableCell>
                  <TableCell>
                    <Chip label={item.is_active ? 'فعال' : 'غیرفعال'} color={item.is_active ? 'success' : 'default'} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleEdit(item)} color="primary"><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => setDeleteId(item.id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
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
        <DialogTitle>{editingId ? 'ویرایش نوع نمونه' : 'افزودن نوع نمونه'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="نام" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required fullWidth />
          <TextField label="کد" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required fullWidth inputProps={{ dir: 'ltr' }} />
          <TextField label="توضیحات" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} fullWidth multiline rows={2} />
          <FormControlLabel
            control={<Switch checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />}
            label="فعال"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.name || !form.code}>ذخیره</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>تأیید حذف</DialogTitle>
        <DialogContent><Typography>آیا از حذف این نوع نمونه مطمئن هستید؟</Typography></DialogContent>
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
