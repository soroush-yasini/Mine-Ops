import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { Driver } from './useDrivers'

export interface Truck {
  id: number
  plate_number: string
  default_driver_id: number | null
  default_driver: Driver | null
  is_active: boolean
}

export function useTrucks() {
  return useQuery({
    queryKey: ['trucks'],
    queryFn: async () => {
      const { data } = await api.get<Truck[]>('/trucks/')
      return data
    },
  })
}

export function useCreateTruck() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Truck, 'id' | 'default_driver'>) => api.post('/trucks/', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trucks'] }),
  })
}

export function useUpdateTruck() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, default_driver, ...data }: Truck) => api.put(`/trucks/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trucks'] }),
  })
}

export function useDeleteTruck() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/trucks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trucks'] }),
  })
}
