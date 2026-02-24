import React, { createContext, useContext, useState } from 'react'

type TonnageUnit = 'kg' | 'ton'

interface TonnageUnitContextType {
  unit: TonnageUnit
  toggle: () => void
}

const TonnageUnitContext = createContext<TonnageUnitContextType>({
  unit: 'ton',
  toggle: () => {},
})

export function TonnageUnitProvider({ children }: { children: React.ReactNode }) {
  const [unit, setUnit] = useState<TonnageUnit>('ton')
  const toggle = () => setUnit(u => u === 'kg' ? 'ton' : 'kg')
  return (
    <TonnageUnitContext.Provider value={{ unit, toggle }}>
      {children}
    </TonnageUnitContext.Provider>
  )
}

export function useTonnageUnit() {
  return useContext(TonnageUnitContext)
}
