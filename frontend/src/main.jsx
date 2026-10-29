import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import BeemaCursor from './components/BeemaCursor.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Mounted beside the app so the cursor survives every view change. */}
    <BeemaCursor />
    <App />
  </StrictMode>,
)
