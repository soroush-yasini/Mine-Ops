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
import { useAuth } from '../../context/AuthContext'
import {
  getGrindingSites, createGrindingSite, updateGrindingSite, deleteGrindingSite,
  type GrindingSite, type GrindingSiteCreate,
} from '../../api/grinding_sites'

const emptyForm: GrindingSiteCreate = { code: '', name_fa: '', name_en: '', is_active: true }

export default function GrindingSiteList() {
  const { isManager } = useAuth()
  const [sites, setSites] = useState<GrindingSite[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<GrindingSiteCreate>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' })

  const fetchSites = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getGrindingSites({ page: page + 1, size: rowsPerPage })
      setSites(data.items)
      setTotal(data.total)
    } catch {
      showSnackbar('خطا در بارگذاری سایت‌ها', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, rowsPerPage])

  useEffect(() => { fetchSites() }, [fetchSites])

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleAdd = () => { setForm(emptyForm); setEditingId(null); setDialogOpen(true) }

  const handleEdit = (site: GrindingSite) => {
    setForm({ code: site.code, name_fa: site.name_fa, name_en: site.name_en, is_active: site.is_active })
    setEditingId(site.id)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.code || !form.name_fa) return
    setSaving(true)
    try {
      if (editingId) {
        await updateGrindingSite(editingId, form)
        showSnackbar('سایت با موفقیت ویرایش شد', 'success')
      } else {
        await createGrindingSite(form)
        showSnackbar('سایت با موفقیت اضافه شد', 'success')
      }
      setDialogOpen(false)
      fetchSites()
    } catch {
      showSnackbar('خطا در ذخیره‌سازی', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteGrindingSite(deleteId)
      showSnackbar('سایت حذف شد', 'success')
      setDeleteId(null)
      fetchSites()
    } catch {
      showSnackbar('خطا در حذف', 'error')
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>سایت‌های آسیاب</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>افزودن سایت</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>کد</TableCell>
              <TableCell>نام فارسی</TableCell>
              <TableCell>نام انگلیسی</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: rowsPerPage }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
              ))
            ) : sites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center"><Typography color="text.secondary" py={3}>داده‌ای یافت نشد</Typography></TableCell>
              </TableRow>
            ) : (
              sites.map(site => (
                <TableRow key={site.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{site.code}</TableCell>
                  <TableCell>{site.name_fa}</TableCell>
                  <TableCell dir="ltr">{site.name_en}</TableCell>
                  <TableCell>
                    <Chip label={site.is_active ? 'فعال' : 'غیرفعال'} color={site.is_active ? 'success' : 'default'} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleEdit(site)} color="primary"><EditIcon fontSize="small" /></IconButton>
                    {isManager && (
                      <IconButton size="small" onClick={() => setDeleteId(site.id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value)); setPage(0) }}
          labelRowsPerPage="ردیف در صفحه:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} از ${count}`}
        />
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'ویرایش سایت' : 'افزودن سایت'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="کد" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required fullWidth inputProps={{ dir: 'ltr' }} />
          <TextField label="نام فارسی" value={form.name_fa} onChange={e => setForm(f => ({ ...f, name_fa: e.target.value }))} required fullWidth />
          <TextField label="نام انگلیسی" value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} fullWidth inputProps={{ dir: 'ltr' }} />
          <FormControlLabel
            control={<Switch checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />}
            label="فعال"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.code || !form.name_fa}>ذخیره</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>تأیید حذف</DialogTitle>
        <DialogContent><Typography>آیا از حذف این سایت مطمئن هستید؟</Typography></DialogContent>
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
