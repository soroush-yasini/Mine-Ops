import apiClient from './client'

export interface Truck {
  id: number
  plate_number: string
  is_active: boolean
  created_at: string
}

export interface TruckCreate {
  plate_number: string
  is_active?: boolean
}

export interface PaginatedTrucks {
  items: Truck[]
  total: number
  page: number
  size: number
}

export const getTrucks = (params?: Record<string, unknown>) =>
  apiClient.get<PaginatedTrucks>('/trucks', { params }).then(r => r.data)

export const getTruck = (id: number) =>
  apiClient.get<Truck>(`/trucks/${id}`).then(r => r.data)

export const createTruck = (data: TruckCreate) =>
  apiClient.post<Truck>('/trucks', data).then(r => r.data)

export const updateTruck = (id: number, data: Partial<TruckCreate>) =>
  apiClient.put<Truck>(`/trucks/${id}`, data).then(r => r.data)

export const deleteTruck = (id: number) =>
  apiClient.delete(`/trucks/${id}`)
