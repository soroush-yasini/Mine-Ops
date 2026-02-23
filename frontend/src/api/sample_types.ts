import apiClient from './client'

export interface SampleType {
  id: number
  name: string
  code: string
  description?: string
  is_active: boolean
  created_at: string
}

export interface SampleTypeCreate {
  name: string
  code: string
  description?: string
  is_active?: boolean
}

export interface PaginatedSampleTypes {
  items: SampleType[]
  total: number
  page: number
  size: number
}

export const getSampleTypes = (params?: Record<string, unknown>) =>
  apiClient.get<PaginatedSampleTypes>('/sample-types', { params }).then(r => r.data)

export const getSampleType = (id: number) =>
  apiClient.get<SampleType>(`/sample-types/${id}`).then(r => r.data)

export const createSampleType = (data: SampleTypeCreate) =>
  apiClient.post<SampleType>('/sample-types', data).then(r => r.data)

export const updateSampleType = (id: number, data: Partial<SampleTypeCreate>) =>
  apiClient.put<SampleType>(`/sample-types/${id}`, data).then(r => r.data)

export const deleteSampleType = (id: number) =>
  apiClient.delete(`/sample-types/${id}`)
