import { createSlice } from '@reduxjs/toolkit'

// Load theme from localStorage
const savedTheme = localStorage.getItem('theme') || 'dark'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: true,
    theme: savedTheme,
    language: 'en',
    aiAssistantOpen: false,
  },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen },
    setSidebarOpen: (state, action) => { state.sidebarOpen = action.payload },
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', state.theme)
      // Update HTML class
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', state.theme === 'dark')
      }
    },
    setTheme: (state, action) => {
      state.theme = action.payload
      localStorage.setItem('theme', action.payload)
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', action.payload === 'dark')
      }
    },
    setLanguage: (state, action) => { state.language = action.payload },
    toggleAIAssistant: (state) => { state.aiAssistantOpen = !state.aiAssistantOpen },
    setAIAssistantOpen: (state, action) => { state.aiAssistantOpen = action.payload },
  },
})

export const {
  toggleSidebar, setSidebarOpen, toggleTheme, setTheme,
  setLanguage, toggleAIAssistant, setAIAssistantOpen
} = uiSlice.actions
export default uiSlice.reducer
