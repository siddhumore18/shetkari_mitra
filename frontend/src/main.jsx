import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import { ChatbotProvider } from './context/ChatbotContext'
import { SidebarProvider } from './context/SidebarContext'
import LanguageGuard from './components/LanguageGuard'
import './i18n/config'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <LanguageGuard>
          <AuthProvider>
            <ChatbotProvider>
              <SidebarProvider>
                <App />
              </SidebarProvider>
            </ChatbotProvider>
          </AuthProvider>
        </LanguageGuard>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>,
)

