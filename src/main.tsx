import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'
import { StoreProvider } from './context/StoreContext'
import { registerSW } from 'virtual:pwa-register'

if (import.meta.env.PROD) {
  registerSW({ immediate: true })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <StoreProvider>
        <App />
      </StoreProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
