import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

export interface LabSample {
  id: number
  report_id: number
  raw_code: string
  facility_code: string | null
  year: number | null
  month: number | null
  day: number | null
  sample_type: string | null
  sample_index: number | null
  au_ppm: number
  threshold_flag: string
}

export interface LabReport {
  id: number
  issue_date: string
  facility_id: number
  report_pdf: string | null
  sample_count: number
  total_cost: number | null
  notes: string | null
  samples: LabSample[]
}

export function useLabReports(filters?: Record<string, string | undefined>) {
  return useQuery({
    queryKey: ['lab-reports', filters],
    queryFn: async () => {
      const { data } = await api.get<LabReport[]>('/lab-reports/', { params: filters })
      return data
    },
  })
}

export function useCreateLabReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<LabReport, 'id' | 'sample_count' | 'samples'>) =>
      api.post('/lab-reports/', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lab-reports'] }),
  })
}

export function useCreateLabSample() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ reportId, raw_code, au_ppm }: { reportId: number; raw_code: string; au_ppm: number }) =>
      api.post(`/lab-reports/${reportId}/samples`, { raw_code, au_ppm }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lab-reports'] }),
  })
}

export function useDeleteLabReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/lab-reports/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lab-reports'] }),
  })
}
