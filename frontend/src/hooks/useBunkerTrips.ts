import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

export interface BunkerTrip {
  id: number
  date: string
  time: string | null
  truck_id: number
  driver_id: number
  receipt_number: number
  tonnage_kg: number
  origin_facility_id: number
  freight_rate_per_ton: number
  recorded_amount: number | null
  computed_amount: number | null
  tonnage_discrepancy_kg: number | null
  notes: string | null
  is_paid: boolean
  payment_date: string | null
  payment_receipt_image: string | null
  payment_notes: string | null
  status: string
}

export function useBunkerTrips(filters?: Record<string, string | boolean | undefined>) {
  return useQuery({
    queryKey: ['bunker-trips', filters],
    queryFn: async () => {
      const { data } = await api.get<BunkerTrip[]>('/bunker-trips/', { params: filters })
      return data
    },
  })
}

export function useCreateBunkerTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<BunkerTrip, 'id' | 'computed_amount' | 'tonnage_discrepancy_kg' | 'is_paid' | 'status'>) =>
      api.post('/bunker-trips/', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bunker-trips'] }),
  })
}

export function useUpdateBunkerTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: BunkerTrip) => api.put(`/bunker-trips/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bunker-trips'] }),
  })
}

export function usePayBunkerTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; payment_date: string; payment_notes?: string; payment_receipt_image?: string }) =>
      api.patch(`/bunker-trips/${id}/payment`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bunker-trips'] }),
  })
}

export function useDeleteBunkerTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/bunker-trips/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bunker-trips'] }),
  })
}
