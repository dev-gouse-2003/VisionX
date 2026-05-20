import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import AIAssistantPanel from '@/components/ai/AIAssistantPanel'
import { fetchNotifications } from '@/store/slices/notificationsSlice'

export default function DashboardLayout() {
  const dispatch = useDispatch()
  const { sidebarOpen, aiAssistantOpen } = useSelector(state => state.ui)

  useEffect(() => {
    dispatch(fetchNotifications())
    const interval = setInterval(() => dispatch(fetchNotifications()), 30000)
    return () => clearInterval(interval)
  }, [dispatch])

  return (
    <div className="flex h-screen bg-[#060b14] overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 relative">
          {/* Background effects */}
          <div className="fixed top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
          <div className="fixed bottom-0 left-1/3 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* AI Assistant Panel */}
      <AnimatePresence>
        {aiAssistantOpen && <AIAssistantPanel />}
      </AnimatePresence>
    </div>
  )
}
