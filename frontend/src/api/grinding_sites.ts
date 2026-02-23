import apiClient from './client'

export interface GrindingSite {
  id: number
  code: string
  name_fa: string
  name_en: string
  is_active: boolean
  created_at: string
}

export interface GrindingSiteCreate {
  code: string
  name_fa: string
  name_en: string
  is_active?: boolean
}

export interface PaginatedGrindingSites {
  items: GrindingSite[]
  total: number
  page: number
  size: number
}

export const getGrindingSites = (params?: Record<string, unknown>) =>
  apiClient.get<PaginatedGrindingSites>('/grinding-sites', { params }).then(r => r.data)

export const getGrindingSite = (id: number) =>
  apiClient.get<GrindingSite>(`/grinding-sites/${id}`).then(r => r.data)

export const createGrindingSite = (data: GrindingSiteCreate) =>
  apiClient.post<GrindingSite>('/grinding-sites', data).then(r => r.data)

export const updateGrindingSite = (id: number, data: Partial<GrindingSiteCreate>) =>
  apiClient.put<GrindingSite>(`/grinding-sites/${id}`, data).then(r => r.data)

export const deleteGrindingSite = (id: number) =>
  apiClient.delete(`/grinding-sites/${id}`)
