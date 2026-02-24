import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

export interface LedgerEntry {
  id: number
  facility_id: number
  date: string
  description: string
  debit: number | null
  credit: number | null
  balance: number | null
  receipt_number: number | null
  ledger_tonnage_kg: number | null
  rate_per_ton: number | null
  bunker_trip_id: number | null
  tonnage_discrepancy_kg: number | null
  discrepancy_flag: boolean
  investigation_notes: string | null
  investigation_status: string
}

export function useFinancialLedger(filters?: Record<string, string | boolean | undefined>) {
  return useQuery({
    queryKey: ['financial-ledger', filters],
    queryFn: async () => {
      const { data } = await api.get<LedgerEntry[]>('/financial-ledger/', { params: filters })
      return data
    },
  })
}

export function useCreateLedgerEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<LedgerEntry, 'id' | 'balance' | 'tonnage_discrepancy_kg' | 'discrepancy_flag'>) =>
      api.post('/financial-ledger/', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['financial-ledger'] }),
  })
}

export function useUpdateInvestigation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; investigation_notes: string; investigation_status: string }) =>
      api.patch(`/financial-ledger/${id}/investigation`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['financial-ledger'] }),
  })
}

export function useDeleteLedgerEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/financial-ledger/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['financial-ledger'] }),
  })
}
