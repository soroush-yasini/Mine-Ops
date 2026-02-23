import { ReactNode } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import { prefixer } from 'stylis'
import stylisRTLPlugin from 'stylis-plugin-rtl'

const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, stylisRTLPlugin],
})

const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Vazirmatn, Arial, sans-serif',
  },
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
})

export default function RTLProvider({ children }: { children: ReactNode }) {
  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </CacheProvider>
  )
}
