import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Switch, FormControlLabel,
  Skeleton, Snackbar, Alert, TablePagination, InputAdornment,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import { useAuth } from '../../context/AuthContext'
import { getDrivers, createDriver, updateDriver, deleteDriver, type Driver, type DriverCreate } from '../../api/drivers'

const emptyForm: DriverCreate = { full_name: '', phone: '', iban: '', is_active: true }

export default function DriverList() {
  const { isManager } = useAuth()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<DriverCreate>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' })

  const fetchDrivers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getDrivers({ page: page + 1, size: rowsPerPage, search })
      setDrivers(data.items)
      setTotal(data.total)
    } catch {
      showSnackbar('خطا در بارگذاری رانندگان', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, rowsPerPage, search])

  useEffect(() => { fetchDrivers() }, [fetchDrivers])

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleAdd = () => {
    setForm(emptyForm)
    setEditingId(null)
    setDialogOpen(true)
  }

  const handleEdit = (driver: Driver) => {
    setForm({ full_name: driver.full_name, phone: driver.phone, iban: driver.iban, is_active: driver.is_active })
    setEditingId(driver.id)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.full_name) return
    setSaving(true)
    try {
      if (editingId) {
        await updateDriver(editingId, form)
        showSnackbar('راننده با موفقیت ویرایش شد', 'success')
      } else {
        await createDriver(form)
        showSnackbar('راننده با موفقیت اضافه شد', 'success')
      }
      setDialogOpen(false)
      fetchDrivers()
    } catch {
      showSnackbar('خطا در ذخیره‌سازی', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteDriver(deleteId)
      showSnackbar('راننده حذف شد', 'success')
      setDeleteId(null)
      fetchDrivers()
    } catch {
      showSnackbar('خطا در حذف راننده', 'error')
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>رانندگان</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          افزودن راننده
        </Button>
      </Box>

      <Paper sx={{ mb: 2, p: 2 }}>
        <TextField
          size="small"
          placeholder="جستجو بر اساس نام..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          sx={{ width: 300 }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>نام کامل</TableCell>
              <TableCell>شماره تماس</TableCell>
              <TableCell>شبا</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: rowsPerPage }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : drivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary" py={3}>داده‌ای یافت نشد</Typography>
                </TableCell>
              </TableRow>
            ) : (
              drivers.map(driver => (
                <TableRow key={driver.id} hover>
                  <TableCell>{driver.full_name}</TableCell>
                  <TableCell dir="ltr">{driver.phone}</TableCell>
                  <TableCell dir="ltr" sx={{ fontFamily: 'monospace' }}>{driver.iban}</TableCell>
                  <TableCell>
                    <Chip
                      label={driver.is_active ? 'فعال' : 'غیرفعال'}
                      color={driver.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleEdit(driver)} color="primary">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {isManager && (
                      <IconButton size="small" onClick={() => setDeleteId(driver.id)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'ویرایش راننده' : 'افزودن راننده'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="نام کامل"
            value={form.full_name}
            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
            required
            fullWidth
          />
          <TextField
            label="شماره تماس"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            fullWidth
            inputProps={{ dir: 'ltr' }}
          />
          <TextField
            label="شبا (IBAN)"
            value={form.iban}
            onChange={e => setForm(f => ({ ...f, iban: e.target.value }))}
            fullWidth
            inputProps={{ dir: 'ltr' }}
            placeholder="IR000000000000000000000000"
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.is_active}
                onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
              />
            }
            label="فعال"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.full_name}>
            ذخیره
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>تأیید حذف</DialogTitle>
        <DialogContent>
          <Typography>آیا از حذف این راننده مطمئن هستید؟</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>انصراف</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>حذف</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
