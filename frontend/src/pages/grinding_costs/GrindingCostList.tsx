import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Skeleton, Snackbar, Alert,
  TablePagination, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useAuth } from '../../context/AuthContext'
import {
  getGrindingCosts, createGrindingCost, updateGrindingCost, deleteGrindingCost,
  uploadReceipt,
  type GrindingCost, type GrindingCostCreate,
} from '../../api/grinding_costs'
import { getGrindingSites, type GrindingSite } from '../../api/grinding_sites'
import JalaliDatePicker from '../../components/shared/JalaliDatePicker'
import SiteAutocomplete from '../../components/shared/SiteAutocomplete'
import FileUpload from '../../components/shared/FileUpload'

const emptyForm: GrindingCostCreate = {
  date: '', site_id: 0, description: '', invoice_no: '',
  tonnage_kg: 0, rate: 0, debit: 0, credit: 0,
}

export default function GrindingCostList() {
  const { isManager } = useAuth()
  const [items, setItems] = useState<GrindingCost[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [sites, setSites] = useState<GrindingSite[]>([])
  const [filterSiteId, setFilterSiteId] = useState<number | ''>('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<GrindingCostCreate>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    getGrindingSites({ size: 100 }).then(d => setSites(d.items)).catch(() => {})
  }, [])

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page: page + 1, size: rowsPerPage }
      if (filterSiteId) params.site_id = filterSiteId
      const data = await getGrindingCosts(params)
      setItems(data.items)
      setTotal(data.total)
    } catch {
      showSnackbar('خطا در بارگذاری', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, rowsPerPage, filterSiteId])

  useEffect(() => { fetchItems() }, [fetchItems])

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleAdd = () => { setForm(emptyForm); setReceiptFile(null); setEditingId(null); setDialogOpen(true) }

  const handleEdit = (item: GrindingCost) => {
    setForm({
      date: item.date, site_id: item.site_id, description: item.description,
      invoice_no: item.invoice_no, tonnage_kg: item.tonnage_kg, rate: item.rate,
      debit: item.debit, credit: item.credit,
    })
    setReceiptFile(null)
    setEditingId(item.id)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.date || !form.site_id || !form.description) return
    setSaving(true)
    try {
      let saved: GrindingCost
      if (editingId) {
        saved = await updateGrindingCost(editingId, form)
        showSnackbar('ویرایش شد', 'success')
      } else {
        saved = await createGrindingCost(form)
        showSnackbar('اضافه شد', 'success')
      }
      if (receiptFile) await uploadReceipt(saved.id, receiptFile)
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
      await deleteGrindingCost(deleteId)
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
        <Typography variant="h5" fontWeight={700}>هزینه‌های آسیاب</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>افزودن</Button>
      </Box>

      <Paper sx={{ mb: 2, p: 2 }}>
        <FormControl size="small" sx={{ width: 250 }}>
          <InputLabel>فیلتر بر اساس سایت</InputLabel>
          <Select
            value={filterSiteId}
            label="فیلتر بر اساس سایت"
            onChange={e => { setFilterSiteId(e.target.value as number | ''); setPage(0) }}
          >
            <MenuItem value="">همه سایت‌ها</MenuItem>
            {sites.map(s => (
              <MenuItem key={s.id} value={s.id}>{s.name_fa}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>تاریخ</TableCell>
              <TableCell>سایت</TableCell>
              <TableCell>شرح</TableCell>
              <TableCell>فاکتور</TableCell>
              <TableCell align="right">تناژ</TableCell>
              <TableCell align="right">نرخ</TableCell>
              <TableCell align="right">بدهکار</TableCell>
              <TableCell align="right">بستانکار</TableCell>
              <TableCell align="right">مانده</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: rowsPerPage }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 10 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center"><Typography color="text.secondary" py={3}>داده‌ای یافت نشد</Typography></TableCell>
              </TableRow>
            ) : (
              items.map(item => (
                <TableRow key={item.id} hover>
                  <TableCell dir="ltr">{item.date}</TableCell>
                  <TableCell>{item.site?.name_fa}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell dir="ltr">{item.invoice_no || '—'}</TableCell>
                  <TableCell align="right">{item.tonnage_kg?.toLocaleString() || '—'}</TableCell>
                  <TableCell align="right">{item.rate?.toLocaleString() || '—'}</TableCell>
                  <TableCell align="right" sx={{ color: 'error.main' }}>
                    {item.debit ? item.debit.toLocaleString() : '—'}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'success.main' }}>
                    {item.credit ? item.credit.toLocaleString() : '—'}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {item.balance !== undefined ? item.balance.toLocaleString() : '—'}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleEdit(item)} color="primary"><EditIcon fontSize="small" /></IconButton>
                    {isManager && (
                      <IconButton size="small" onClick={() => setDeleteId(item.id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'ویرایش هزینه' : 'افزودن هزینه'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, pt: 1 }}>
            <JalaliDatePicker label="تاریخ" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} required />
            <SiteAutocomplete value={form.site_id || null} onChange={v => setForm(f => ({ ...f, site_id: v ?? 0 }))} required />
            <TextField
              label="شرح" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              fullWidth required sx={{ gridColumn: '1 / -1' }}
            />
            <TextField
              label="شماره فاکتور" value={form.invoice_no || ''}
              onChange={e => setForm(f => ({ ...f, invoice_no: e.target.value }))}
              fullWidth inputProps={{ dir: 'ltr' }}
            />
            <TextField
              label="تناژ (کیلوگرم)" type="number" value={form.tonnage_kg || ''}
              onChange={e => setForm(f => ({ ...f, tonnage_kg: parseFloat(e.target.value) || 0 }))}
              fullWidth inputProps={{ dir: 'ltr' }}
            />
            <TextField
              label="نرخ" type="number" value={form.rate || ''}
              onChange={e => setForm(f => ({ ...f, rate: parseFloat(e.target.value) || 0 }))}
              fullWidth inputProps={{ dir: 'ltr' }}
            />
            <TextField
              label="بدهکار" type="number" value={form.debit || ''}
              onChange={e => setForm(f => ({ ...f, debit: parseFloat(e.target.value) || 0 }))}
              fullWidth inputProps={{ dir: 'ltr' }}
            />
            <TextField
              label="بستانکار" type="number" value={form.credit || ''}
              onChange={e => setForm(f => ({ ...f, credit: parseFloat(e.target.value) || 0 }))}
              fullWidth inputProps={{ dir: 'ltr' }}
            />
            <Box sx={{ gridColumn: '1 / -1' }}>
              <FileUpload label="رسید / فاکتور" onUpload={file => setReceiptFile(file)} accept="image/*,.pdf" />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.date || !form.site_id || !form.description}>ذخیره</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>تأیید حذف</DialogTitle>
        <DialogContent><Typography>آیا از حذف این رکورد مطمئن هستید؟</Typography></DialogContent>
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
