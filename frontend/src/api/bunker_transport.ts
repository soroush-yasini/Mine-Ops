import apiClient from './client'

export interface BunkerTransport {
  id: number
  date: string
  time?: string
  truck_id: number
  driver_id: number
  origin: string
  destination: string
  tonnage_kg: number
  billed_tonnage_kg?: number
  cost_per_kg: number
  receipt_no: string
  bill_of_lading_url?: string
  is_dead_freight: boolean
  is_paid: boolean
  payment_date?: string
  payment_receipt_url?: string
  notes?: string
  truck?: { id: number; plate_number: string }
  driver?: { id: number; full_name: string }
  created_at: string
}

export interface BunkerTransportCreate {
  date: string
  time?: string
  truck_id: number
  driver_id: number
  origin: string
  destination: string
  tonnage_kg: number
  billed_tonnage_kg?: number
  cost_per_kg: number
  receipt_no: string
  is_dead_freight?: boolean
  notes?: string
}

export interface BunkerTransportPayment {
  payment_date: string
  notes?: string
}

export interface PaginatedBunkerTransports {
  items: BunkerTransport[]
  total: number
  page: number
  size: number
}

export const getBunkerTransports = (params?: Record<string, unknown>) =>
  apiClient.get<PaginatedBunkerTransports>('/bunker-transport', { params }).then(r => r.data)

export const getBunkerTransport = (id: number) =>
  apiClient.get<BunkerTransport>(`/bunker-transport/${id}`).then(r => r.data)

export const createBunkerTransport = (data: BunkerTransportCreate) =>
  apiClient.post<BunkerTransport>('/bunker-transport', data).then(r => r.data)

export const updateBunkerTransport = (id: number, data: Partial<BunkerTransportCreate>) =>
  apiClient.put<BunkerTransport>(`/bunker-transport/${id}`, data).then(r => r.data)

export const payBunkerTransport = (id: number, data: BunkerTransportPayment) =>
  apiClient.post<BunkerTransport>(`/bunker-transport/${id}/pay`, data).then(r => r.data)

export const deleteBunkerTransport = (id: number) =>
  apiClient.delete(`/bunker-transport/${id}`)

export const uploadBillOfLading = (id: number, file: File) => {
  const fd = new FormData()
  fd.append('file', file)
  return apiClient.post<BunkerTransport>(`/bunker-transport/${id}/bill-of-lading`, fd).then(r => r.data)
}

export const uploadPaymentReceipt = (id: number, file: File) => {
  const fd = new FormData()
  fd.append('file', file)
  return apiClient.post<BunkerTransport>(`/bunker-transport/${id}/payment-receipt`, fd).then(r => r.data)
}

export const importBunkerTransports = (rows: Record<string, unknown>[]) =>
  apiClient.post<{ success: number; errors: string[] }>('/bunker-transport/import', { rows }).then(r => r.data)
