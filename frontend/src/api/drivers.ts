import apiClient from './client'

export interface Driver {
  id: number
  full_name: string
  phone: string
  iban: string
  is_active: boolean
  created_at: string
}

export interface DriverCreate {
  full_name: string
  phone: string
  iban: string
  is_active?: boolean
}

export interface PaginatedDrivers {
  items: Driver[]
  total: number
  page: number
  size: number
}

export const getDrivers = (params?: Record<string, unknown>) =>
  apiClient.get<PaginatedDrivers>('/drivers', { params }).then(r => r.data)

export const getDriver = (id: number) =>
  apiClient.get<Driver>(`/drivers/${id}`).then(r => r.data)

export const createDriver = (data: DriverCreate) =>
  apiClient.post<Driver>('/drivers', data).then(r => r.data)

export const updateDriver = (id: number, data: Partial<DriverCreate>) =>
  apiClient.put<Driver>(`/drivers/${id}`, data).then(r => r.data)

export const deleteDriver = (id: number) =>
  apiClient.delete(`/drivers/${id}`)
