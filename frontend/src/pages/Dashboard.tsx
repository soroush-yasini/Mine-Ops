import { useEffect, useState } from 'react'
import {
  Box, Grid, Card, CardContent, Typography, Skeleton,
} from '@mui/material'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import PersonIcon from '@mui/icons-material/Person'
import ScienceIcon from '@mui/icons-material/Science'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import apiClient from '../api/client'

interface Stats {
  drivers: number
  trucks: number
  mine_transports: number
  bunker_transports: number
  lab_batches: number
  unpaid_mine: number
  unpaid_bunker: number
}

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  color: string
  subtitle?: string
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: color,
              borderRadius: '50%',
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [drivers, trucks, mine, bunker, batches] = await Promise.all([
          apiClient.get('/drivers?size=1').catch(() => ({ data: { total: 0 } })),
          apiClient.get('/trucks?size=1').catch(() => ({ data: { total: 0 } })),
          apiClient.get('/mine-transport?size=1').catch(() => ({ data: { total: 0 } })),
          apiClient.get('/bunker-transport?size=1').catch(() => ({ data: { total: 0 } })),
          apiClient.get('/lab/batches?size=1').catch(() => ({ data: { total: 0 } })),
        ])
        const unpaidMine = await apiClient.get('/mine-transport?size=1&is_paid=false').catch(() => ({ data: { total: 0 } }))
        const unpaidBunker = await apiClient.get('/bunker-transport?size=1&is_paid=false').catch(() => ({ data: { total: 0 } }))
        setStats({
          drivers: drivers.data.total ?? 0,
          trucks: trucks.data.total ?? 0,
          mine_transports: mine.data.total ?? 0,
          bunker_transports: bunker.data.total ?? 0,
          lab_batches: batches.data.total ?? 0,
          unpaid_mine: unpaidMine.data.total ?? 0,
          unpaid_bunker: unpaidBunker.data.total ?? 0,
        })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const cards = [
    { title: 'رانندگان فعال', value: stats?.drivers ?? 0, icon: <PersonIcon />, color: '#1976d2', subtitle: 'راننده ثبت‌شده' },
    { title: 'ماشین‌آلات', value: stats?.trucks ?? 0, icon: <LocalShippingIcon />, color: '#388e3c', subtitle: 'کامیون ثبت‌شده' },
    { title: 'حمل از معدن', value: stats?.mine_transports ?? 0, icon: <LocalShippingIcon />, color: '#f57c00', subtitle: `${stats?.unpaid_mine ?? 0} پرداخت‌نشده` },
    { title: 'حمل به کارخانه', value: stats?.bunker_transports ?? 0, icon: <LocalShippingIcon />, color: '#7b1fa2', subtitle: `${stats?.unpaid_bunker ?? 0} پرداخت‌نشده` },
    { title: 'دسته‌های آزمایشگاه', value: stats?.lab_batches ?? 0, icon: <ScienceIcon />, color: '#c62828', subtitle: 'دسته آنالیز' },
    { title: 'هزینه‌های آسیاب', icon: <AttachMoneyIcon />, value: '—', color: '#00838f', subtitle: 'مشاهده جزئیات' },
  ]

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>
        داشبورد
      </Typography>
      <Grid container spacing={3}>
        {cards.map((card, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            {loading ? (
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
            ) : (
              <StatCard {...card} />
            )}
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
