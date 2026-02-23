import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Switch, FormControlLabel,
  Skeleton, Snackbar, Alert, TablePagination, Tabs, Tab,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import PaymentIcon from '@mui/icons-material/Payment'
import UploadIcon from '@mui/icons-material/Upload'
import { useAuth } from '../../context/AuthContext'
import {
  getMineTransports, createMineTransport, updateMineTransport,
  deleteMineTransport, payMineTransport, uploadBillOfLading, uploadPaymentReceipt,
  importMineTransports,
  type MineTransport, type MineTransportCreate,
} from '../../api/mine_transport'
import JalaliDatePicker from '../../components/shared/JalaliDatePicker'
import DriverAutocomplete from '../../components/shared/DriverAutocomplete'
import TruckAutocomplete from '../../components/shared/TruckAutocomplete'
import FileUpload from '../../components/shared/FileUpload'
import ExcelImport from '../../components/shared/ExcelImport'

const emptyForm: MineTransportCreate = {
  date: '', truck_id: 0, driver_id: 0, destination: '',
  tonnage_kg: 0, cost_per_kg: 0, receipt_no: '', notes: '',
}

const emptyPayForm = { payment_date: '', notes: '' }

const EXCEL_COLS = [
  { key: 'date', label: 'تاریخ' },
  { key: 'truck_plate', label: 'شماره ماشین' },
  { key: 'driver_name', label: 'راننده' },
  { key: 'destination', label: 'مقصد' },
  { key: 'tonnage_kg', label: 'تناژ (کیلوگرم)' },
  { key: 'cost_per_kg', label: 'هزینه/کیلوگرم' },
  { key: 'receipt_no', label: 'شماره قبض' },
]

export default function MineTransportList() {
  const { isManager } = useAuth()
  const [items, setItems] = useState<MineTransport[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [filterTab, setFilterTab] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [payDialogOpen, setPayDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [payingId, setPayingId] = useState<number | null>(null)
  const [form, setForm] = useState<MineTransportCreate>(emptyForm)
  const [payForm, setPayForm] = useState(emptyPayForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [excelOpen, setExcelOpen] = useState(false)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' })
  const [billFile, setBillFile] = useState<File | null>(null)
  const [payReceiptFile, setPayReceiptFile] = useState<File | null>(null)

  const isPaidFilter = filterTab === 1 ? true : filterTab === 2 ? false : undefined

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getMineTransports({ page: page + 1, size: rowsPerPage, is_paid: isPaidFilter })
      setItems(data.items)
      setTotal(data.total)
    } catch {
      showSnackbar('خطا در بارگذاری', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, rowsPerPage, isPaidFilter])

  useEffect(() => { fetchItems() }, [fetchItems])

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleAdd = () => {
    setForm(emptyForm)
    setBillFile(null)
    setEditingId(null)
    setDialogOpen(true)
  }

  const handleEdit = (item: MineTransport) => {
    setForm({
      date: item.date, truck_id: item.truck_id, driver_id: item.driver_id,
      destination: item.destination, tonnage_kg: item.tonnage_kg,
      cost_per_kg: item.cost_per_kg, receipt_no: item.receipt_no, notes: item.notes,
    })
    setBillFile(null)
    setEditingId(item.id)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.date || !form.truck_id || !form.driver_id) return
    setSaving(true)
    try {
      let saved: MineTransport
      if (editingId) {
        saved = await updateMineTransport(editingId, form)
        showSnackbar('ویرایش شد', 'success')
      } else {
        saved = await createMineTransport(form)
        showSnackbar('اضافه شد', 'success')
      }
      if (billFile) {
        await uploadBillOfLading(saved.id, billFile)
      }
      setDialogOpen(false)
      fetchItems()
    } catch {
      showSnackbar('خطا در ذخیره‌سازی', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handlePayOpen = (item: MineTransport) => {
    setPayingId(item.id)
    setPayForm(emptyPayForm)
    setPayReceiptFile(null)
    setPayDialogOpen(true)
  }

  const handlePay = async () => {
    if (!payingId || !payForm.payment_date) return
    setSaving(true)
    try {
      const saved = await payMineTransport(payingId, payForm)
      if (payReceiptFile) {
        await uploadPaymentReceipt(saved.id, payReceiptFile)
      }
      showSnackbar('پرداخت ثبت شد', 'success')
      setPayDialogOpen(false)
      fetchItems()
    } catch {
      showSnackbar('خطا در ثبت پرداخت', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMineTransport(deleteId)
      showSnackbar('حذف شد', 'success')
      setDeleteId(null)
      fetchItems()
    } catch {
      showSnackbar('خطا در حذف', 'error')
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>حمل از معدن به آسیاب</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<UploadIcon />} onClick={() => setExcelOpen(true)}>وارد کردن Excel</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>افزودن</Button>
        </Box>
      </Box>

      <Tabs value={filterTab} onChange={(_, v) => { setFilterTab(v); setPage(0) }} sx={{ mb: 2 }}>
        <Tab label="همه" />
        <Tab label="پرداخت‌شده" />
        <Tab label="پرداخت‌نشده" />
      </Tabs>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>تاریخ</TableCell>
              <TableCell>شماره ماشین</TableCell>
              <TableCell>راننده</TableCell>
              <TableCell>مقصد</TableCell>
              <TableCell align="right">تناژ (کیلوگرم)</TableCell>
              <TableCell align="right">هزینه/کیلوگرم</TableCell>
              <TableCell>شماره قبض</TableCell>
              <TableCell>پرداخت</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: rowsPerPage }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 9 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center"><Typography color="text.secondary" py={3}>داده‌ای یافت نشد</Typography></TableCell>
              </TableRow>
            ) : (
              items.map(item => (
                <TableRow
                  key={item.id}
                  hover
                  sx={{ bgcolor: !item.is_paid ? 'warning.light' : undefined }}
                >
                  <TableCell dir="ltr">{item.date}</TableCell>
                  <TableCell dir="ltr">{item.truck?.plate_number}</TableCell>
                  <TableCell>{item.driver?.full_name}</TableCell>
                  <TableCell>{item.destination}</TableCell>
                  <TableCell align="right">{item.tonnage_kg?.toLocaleString()}</TableCell>
                  <TableCell align="right">{item.cost_per_kg?.toLocaleString()}</TableCell>
                  <TableCell dir="ltr">{item.receipt_no}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.is_paid ? 'پرداخت شده' : 'پرداخت نشده'}
                      color={item.is_paid ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                    {!item.is_paid && (
                      <IconButton size="small" onClick={() => handlePayOpen(item)} color="success" title="ثبت پرداخت">
                        <PaymentIcon fontSize="small" />
                      </IconButton>
                    )}
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'ویرایش حمل' : 'افزودن حمل'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, pt: 1 }}>
            <JalaliDatePicker label="تاریخ" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} required />
            <TextField
              label="شماره قبض" value={form.receipt_no}
              onChange={e => setForm(f => ({ ...f, receipt_no: e.target.value }))}
              fullWidth inputProps={{ dir: 'ltr' }}
            />
            <TruckAutocomplete value={form.truck_id || null} onChange={v => setForm(f => ({ ...f, truck_id: v ?? 0 }))} required />
            <DriverAutocomplete value={form.driver_id || null} onChange={v => setForm(f => ({ ...f, driver_id: v ?? 0 }))} required />
            <TextField
              label="مقصد" value={form.destination}
              onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
              fullWidth
            />
            <TextField
              label="تناژ (کیلوگرم)" type="number" value={form.tonnage_kg || ''}
              onChange={e => setForm(f => ({ ...f, tonnage_kg: parseFloat(e.target.value) || 0 }))}
              fullWidth inputProps={{ dir: 'ltr' }}
            />
            <TextField
              label="هزینه به ازای هر کیلوگرم" type="number" value={form.cost_per_kg || ''}
              onChange={e => setForm(f => ({ ...f, cost_per_kg: parseFloat(e.target.value) || 0 }))}
              fullWidth inputProps={{ dir: 'ltr' }}
            />
            <TextField
              label="یادداشت" value={form.notes || ''}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              fullWidth multiline rows={2}
            />
            <Box sx={{ gridColumn: '1 / -1' }}>
              <FileUpload
                label="بارنامه"
                onUpload={file => setBillFile(file)}
                accept="image/*,.pdf"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.date || !form.truck_id || !form.driver_id}>ذخیره</Button>
        </DialogActions>
      </Dialog>

      {/* Pay Dialog */}
      <Dialog open={payDialogOpen} onClose={() => setPayDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>ثبت پرداخت</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <JalaliDatePicker label="تاریخ پرداخت" value={payForm.payment_date} onChange={v => setPayForm(f => ({ ...f, payment_date: v }))} required />
          <TextField
            label="یادداشت" value={payForm.notes}
            onChange={e => setPayForm(f => ({ ...f, notes: e.target.value }))}
            fullWidth multiline rows={2}
          />
          <FileUpload label="رسید پرداخت" onUpload={file => setPayReceiptFile(file)} accept="image/*,.pdf" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayDialogOpen(false)}>انصراف</Button>
          <Button variant="contained" color="success" onClick={handlePay} disabled={saving || !payForm.payment_date}>تأیید پرداخت</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>تأیید حذف</DialogTitle>
        <DialogContent><Typography>آیا از حذف این رکورد مطمئن هستید؟</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>انصراف</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>حذف</Button>
        </DialogActions>
      </Dialog>

      <ExcelImport
        open={excelOpen}
        onClose={() => setExcelOpen(false)}
        onImport={rows => importMineTransports(rows)}
        columns={EXCEL_COLS}
        title="وارد کردن حمل از معدن"
      />

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}
