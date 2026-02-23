import apiClient from './client'

export interface MineTransport {
  id: number
  date: string
  truck_id: number
  driver_id: number
  destination: string
  tonnage_kg: number
  cost_per_kg: number
  receipt_no: string
  bill_of_lading_url?: string
  is_paid: boolean
  payment_date?: string
  payment_receipt_url?: string
  notes?: string
  truck?: { id: number; plate_number: string }
  driver?: { id: number; full_name: string }
  created_at: string
}

export interface MineTransportCreate {
  date: string
  truck_id: number
  driver_id: number
  destination: string
  tonnage_kg: number
  cost_per_kg: number
  receipt_no: string
  notes?: string
}

export interface MineTransportPayment {
  payment_date: string
  notes?: string
}

export interface PaginatedMineTransports {
  items: MineTransport[]
  total: number
  page: number
  size: number
}

export const getMineTransports = (params?: Record<string, unknown>) =>
  apiClient.get<PaginatedMineTransports>('/mine-transport', { params }).then(r => r.data)

export const getMineTransport = (id: number) =>
  apiClient.get<MineTransport>(`/mine-transport/${id}`).then(r => r.data)

export const createMineTransport = (data: MineTransportCreate) =>
  apiClient.post<MineTransport>('/mine-transport', data).then(r => r.data)

export const updateMineTransport = (id: number, data: Partial<MineTransportCreate>) =>
  apiClient.put<MineTransport>(`/mine-transport/${id}`, data).then(r => r.data)

export const payMineTransport = (id: number, data: MineTransportPayment) =>
  apiClient.post<MineTransport>(`/mine-transport/${id}/pay`, data).then(r => r.data)

export const deleteMineTransport = (id: number) =>
  apiClient.delete(`/mine-transport/${id}`)

export const uploadBillOfLading = (id: number, file: File) => {
  const fd = new FormData()
  fd.append('file', file)
  return apiClient.post<MineTransport>(`/mine-transport/${id}/bill-of-lading`, fd).then(r => r.data)
}

export const uploadPaymentReceipt = (id: number, file: File) => {
  const fd = new FormData()
  fd.append('file', file)
  return apiClient.post<MineTransport>(`/mine-transport/${id}/payment-receipt`, fd).then(r => r.data)
}

export const importMineTransports = (rows: Record<string, unknown>[]) =>
  apiClient.post<{ success: number; errors: string[] }>('/mine-transport/import', { rows }).then(r => r.data)
