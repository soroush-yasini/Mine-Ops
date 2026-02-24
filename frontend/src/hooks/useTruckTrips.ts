import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

export interface TruckTrip {
  id: number
  date: string
  truck_id: number
  driver_id: number
  receipt_number: number
  tonnage_kg: number
  destination_facility_id: number
  freight_rate_per_ton: number
  total_freight_cost: number | null
  bol_image: string | null
  is_paid: boolean
  payment_date: string | null
  payment_time: string | null
  payment_receipt_image: string | null
  payment_notes: string | null
  status: string
}

export function useTruckTrips(filters?: Record<string, string | boolean | undefined>) {
  return useQuery({
    queryKey: ['truck-trips', filters],
    queryFn: async () => {
      const { data } = await api.get<TruckTrip[]>('/truck-trips/', { params: filters })
      return data
    },
  })
}

export function useCreateTruckTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<TruckTrip, 'id' | 'total_freight_cost' | 'is_paid' | 'status'>) =>
      api.post('/truck-trips/', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['truck-trips'] }),
  })
}

export function useUpdateTruckTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: TruckTrip) => api.put(`/truck-trips/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['truck-trips'] }),
  })
}

export function usePayTruckTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; payment_date: string; payment_notes?: string; payment_receipt_image?: string }) =>
      api.patch(`/truck-trips/${id}/payment`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['truck-trips'] }),
  })
}

export function useDeleteTruckTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/truck-trips/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['truck-trips'] }),
  })
}
