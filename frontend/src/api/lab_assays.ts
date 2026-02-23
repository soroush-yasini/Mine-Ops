import apiClient from './client'

export interface LabAssay {
  id: number
  batch_id: number
  sample_code: string
  facility: string
  date: string
  sample_type_id: number
  au_ppm: number
  sample_type?: { id: number; name: string; code: string }
  created_at: string
}

export interface LabAssayCreate {
  batch_id: number
  sample_code: string
  facility: string
  date: string
  sample_type_id: number
  au_ppm: number
}

export interface PaginatedLabAssays {
  items: LabAssay[]
  total: number
  page: number
  size: number
}

export const getLabAssays = (batchId: number, params?: Record<string, unknown>) =>
  apiClient.get<PaginatedLabAssays>(`/lab/batches/${batchId}/assays`, { params }).then(r => r.data)

export const createLabAssay = (data: LabAssayCreate) =>
  apiClient.post<LabAssay>('/lab/assays', data).then(r => r.data)

export const updateLabAssay = (id: number, data: Partial<LabAssayCreate>) =>
  apiClient.put<LabAssay>(`/lab/assays/${id}`, data).then(r => r.data)

export const deleteLabAssay = (id: number) =>
  apiClient.delete(`/lab/assays/${id}`)

export const importLabAssays = (batchId: number, rows: Record<string, unknown>[]) =>
  apiClient.post<{ success: number; errors: string[] }>(`/lab/batches/${batchId}/assays/import`, { rows }).then(r => r.data)
