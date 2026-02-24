import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

export interface Facility {
  id: number
  code: string
  name_fa: string
  name_en: string
  is_active: boolean
}

export function useFacilities() {
  return useQuery({
    queryKey: ['facilities'],
    queryFn: async () => {
      const { data } = await api.get<Facility[]>('/facilities/')
      return data
    },
  })
}

export function useCreateFacility() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Facility, 'id'>) => api.post('/facilities/', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['facilities'] }),
  })
}

export function useUpdateFacility() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Facility) => api.put(`/facilities/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['facilities'] }),
  })
}

export function useDeleteFacility() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/facilities/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['facilities'] }),
  })
}
