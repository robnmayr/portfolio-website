import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource-variable/exo-2'
import '@fontsource/work-sans'
import '@fontsource/silkscreen'

import './styles/tokens.css'
import './styles/fonts.css'
import './styles/global.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
