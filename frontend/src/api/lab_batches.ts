import apiClient from './client'

export interface LabBatch {
  id: number
  issue_date: string
  sample_count: number
  total_cost: number
  description?: string
  created_at: string
}

export interface LabBatchCreate {
  issue_date: string
  description?: string
}

export interface PaginatedLabBatches {
  items: LabBatch[]
  total: number
  page: number
  size: number
}

export const getLabBatches = (params?: Record<string, unknown>) =>
  apiClient.get<PaginatedLabBatches>('/lab/batches', { params }).then(r => r.data)

export const getLabBatch = (id: number) =>
  apiClient.get<LabBatch>(`/lab/batches/${id}`).then(r => r.data)

export const createLabBatch = (data: LabBatchCreate) =>
  apiClient.post<LabBatch>('/lab/batches', data).then(r => r.data)

export const updateLabBatch = (id: number, data: Partial<LabBatchCreate>) =>
  apiClient.put<LabBatch>(`/lab/batches/${id}`, data).then(r => r.data)

export const deleteLabBatch = (id: number) =>
  apiClient.delete(`/lab/batches/${id}`)
