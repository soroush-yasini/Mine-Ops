import apiClient from './client'

export interface GrindingCost {
  id: number
  date: string
  site_id: number
  description: string
  invoice_no?: string
  receipt_url?: string
  tonnage_kg?: number
  rate?: number
  debit: number
  credit: number
  balance?: number
  site?: { id: number; code: string; name_fa: string }
  created_at: string
}

export interface GrindingCostCreate {
  date: string
  site_id: number
  description: string
  invoice_no?: string
  tonnage_kg?: number
  rate?: number
  debit?: number
  credit?: number
}

export interface PaginatedGrindingCosts {
  items: GrindingCost[]
  total: number
  page: number
  size: number
}

export const getGrindingCosts = (params?: Record<string, unknown>) =>
  apiClient.get<PaginatedGrindingCosts>('/grinding-costs', { params }).then(r => r.data)

export const getGrindingCost = (id: number) =>
  apiClient.get<GrindingCost>(`/grinding-costs/${id}`).then(r => r.data)

export const createGrindingCost = (data: GrindingCostCreate) =>
  apiClient.post<GrindingCost>('/grinding-costs', data).then(r => r.data)

export const updateGrindingCost = (id: number, data: Partial<GrindingCostCreate>) =>
  apiClient.put<GrindingCost>(`/grinding-costs/${id}`, data).then(r => r.data)

export const deleteGrindingCost = (id: number) =>
  apiClient.delete(`/grinding-costs/${id}`)

export const uploadReceipt = (id: number, file: File) => {
  const fd = new FormData()
  fd.append('file', file)
  return apiClient.post<GrindingCost>(`/grinding-costs/${id}/receipt`, fd).then(r => r.data)
}
