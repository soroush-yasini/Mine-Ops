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
import { getTrucks, createTruck, updateTruck, deleteTruck, type Truck, type TruckCreate } from '../../api/trucks'

const emptyForm: TruckCreate = { plate_number: '', is_active: true }

export default function TruckList() {
  const { isManager } = useAuth()
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<TruckCreate>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' })

  const fetchTrucks = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getTrucks({ page: page + 1, size: rowsPerPage })
      setTrucks(data.items)
      setTotal(data.total)
    } catch {
      showSnackbar('خطا در بارگذاری ماشین‌ها', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, rowsPerPage])

  useEffect(() => { fetchTrucks() }, [fetchTrucks])

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleAdd = () => { setForm(emptyForm); setEditingId(null); setDialogOpen(true) }

  const handleEdit = (truck: Truck) => {
    setForm({ plate_number: truck.plate_number, is_active: truck.is_active })
    setEditingId(truck.id)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.plate_number) return
    setSaving(true)
    try {
      if (editingId) {
        await updateTruck(editingId, form)
        showSnackbar('ماشین با موفقیت ویرایش شد', 'success')
      } else {
        await createTruck(form)
        showSnackbar('ماشین با موفقیت اضافه شد', 'success')
      }
      setDialogOpen(false)
      fetchTrucks()
    } catch {
      showSnackbar('خطا در ذخیره‌سازی', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteTruck(deleteId)
      showSnackbar('ماشین حذف شد', 'success')
      setDeleteId(null)
      fetchTrucks()
    } catch {
      showSnackbar('خطا در حذف', 'error')
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>ماشین‌ها</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          افزودن ماشین
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>شماره پلاک</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: rowsPerPage }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 3 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}
                </TableRow>
              ))
            ) : trucks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography color="text.secondary" py={3}>داده‌ای یافت نشد</Typography>
                </TableCell>
              </TableRow>
            ) : (
              trucks.map(truck => (
                <TableRow key={truck.id} hover>
                  <TableCell dir="ltr" sx={{ fontWeight: 500 }}>{truck.plate_number}</TableCell>
                  <TableCell>
                    <Chip label={truck.is_active ? 'فعال' : 'غیرفعال'} color={truck.is_active ? 'success' : 'default'} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleEdit(truck)} color="primary"><EditIcon fontSize="small" /></IconButton>
                    {isManager && (
                      <IconButton size="small" onClick={() => setDeleteId(truck.id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
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
        <DialogTitle>{editingId ? 'ویرایش ماشین' : 'افزودن ماشین'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="شماره پلاک"
            value={form.plate_number}
            onChange={e => setForm(f => ({ ...f, plate_number: e.target.value }))}
            required
            fullWidth
            inputProps={{ dir: 'ltr' }}
          />
          <FormControlLabel
            control={<Switch checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />}
            label="فعال"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.plate_number}>ذخیره</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>تأیید حذف</DialogTitle>
        <DialogContent><Typography>آیا از حذف این ماشین مطمئن هستید؟</Typography></DialogContent>
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
