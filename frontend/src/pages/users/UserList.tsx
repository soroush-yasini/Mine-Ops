import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Switch, FormControlLabel,
  Skeleton, Snackbar, Alert, TablePagination,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  getUsers, createUser, updateUser, deleteUser,
  type User, type UserCreate, type UserUpdate,
} from '../../api/users'

const ROLES = [
  { value: 'manager', label: 'مدیر' },
  { value: 'operator', label: 'اپراتور' },
  { value: 'viewer', label: 'مشاهده‌گر' },
]

const emptyForm: UserCreate = { username: '', full_name: '', password: '', role: 'operator', is_active: true }

export default function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<UserCreate>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' })

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getUsers({ page: page + 1, size: rowsPerPage })
      setUsers(data.items)
      setTotal(data.total)
    } catch {
      showSnackbar('خطا در بارگذاری', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, rowsPerPage])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleAdd = () => { setForm(emptyForm); setEditingId(null); setDialogOpen(true) }

  const handleEdit = (user: User) => {
    setForm({ username: user.username, full_name: user.full_name, password: '', role: user.role, is_active: user.is_active })
    setEditingId(user.id)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.username || !form.full_name) return
    setSaving(true)
    try {
      if (editingId) {
        const updateData: UserUpdate = {
          full_name: form.full_name,
          role: form.role,
          is_active: form.is_active,
        }
        if (form.password) updateData.password = form.password
        await updateUser(editingId, updateData)
        showSnackbar('ویرایش شد', 'success')
      } else {
        if (!form.password) { showSnackbar('رمز عبور الزامی است', 'error'); setSaving(false); return }
        await createUser(form)
        showSnackbar('کاربر اضافه شد', 'success')
      }
      setDialogOpen(false)
      fetchUsers()
    } catch {
      showSnackbar('خطا در ذخیره‌سازی', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteUser(deleteId)
      showSnackbar('حذف شد', 'success')
      setDeleteId(null)
      fetchUsers()
    } catch {
      showSnackbar('خطا در حذف', 'error')
    }
  }

  const getRoleLabel = (role: string) => ROLES.find(r => r.value === role)?.label || role

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>مدیریت کاربران</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>افزودن کاربر</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>نام کاربری</TableCell>
              <TableCell>نام کامل</TableCell>
              <TableCell>نقش</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: rowsPerPage }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center"><Typography color="text.secondary" py={3}>داده‌ای یافت نشد</Typography></TableCell>
              </TableRow>
            ) : (
              users.map(user => (
                <TableRow key={user.id} hover>
                  <TableCell dir="ltr">{user.username}</TableCell>
                  <TableCell>{user.full_name}</TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleLabel(user.role)}
                      color={user.role === 'manager' ? 'primary' : user.role === 'operator' ? 'info' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={user.is_active ? 'فعال' : 'غیرفعال'} color={user.is_active ? 'success' : 'default'} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleEdit(user)} color="primary"><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => setDeleteId(user.id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
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
        <DialogTitle>{editingId ? 'ویرایش کاربر' : 'افزودن کاربر'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="نام کاربری" value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            required fullWidth inputProps={{ dir: 'ltr' }}
            disabled={!!editingId}
          />
          <TextField
            label="نام کامل" value={form.full_name}
            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
            required fullWidth
          />
          <TextField
            label={editingId ? 'رمز عبور جدید (اختیاری)' : 'رمز عبور'}
            type="password" value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required={!editingId} fullWidth inputProps={{ dir: 'ltr' }}
          />
          <FormControl fullWidth>
            <InputLabel>نقش</InputLabel>
            <Select
              value={form.role}
              label="نقش"
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            >
              {ROLES.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControlLabel
            control={<Switch checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />}
            label="فعال"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.username || !form.full_name}>ذخیره</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>تأیید حذف</DialogTitle>
        <DialogContent><Typography>آیا از حذف این کاربر مطمئن هستید؟</Typography></DialogContent>
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
