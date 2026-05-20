import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, Building2, Users, BarChart3,
  FileBarChart, Shield, Bell, LogOut, ChevronLeft, ChevronRight,
  Zap, MessageSquarePlus, ClipboardList, Search, Bot
} from 'lucide-react'
import { logout } from '@/store/slices/authSlice'
import { toggleSidebar, toggleAIAssistant } from '@/store/slices/uiSlice'
import clsx from 'clsx'

const NAV_ITEMS = {
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: FileText, label: 'Complaints', path: '/admin/complaints' },
    { icon: Building2, label: 'Departments', path: '/admin/departments' },
    { icon: Users, label: 'Officers', path: '/admin/officers' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: FileBarChart, label: 'Reports', path: '/admin/reports' },
    { icon: Shield, label: 'Audit Logs', path: '/admin/audit-logs' },
  ],
  officer: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/officer/dashboard' },
    { icon: ClipboardList, label: 'My Complaints', path: '/officer/complaints' },
  ],
  citizen: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/citizen/dashboard' },
    { icon: MessageSquarePlus, label: 'Submit Complaint', path: '/citizen/submit' },
    { icon: FileText, label: 'My Complaints', path: '/citizen/complaints' },
    { icon: Search, label: 'Track Complaint', path: '/citizen/track' },
  ],
}

export default function Sidebar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const { sidebarOpen } = useSelector(state => state.ui)
  const { unreadCount } = useSelector(state => state.notifications)

  const navItems = NAV_ITEMS[user?.role] || []

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/login')
  }

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 260 : 72 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative flex flex-col bg-[#0a0f1e] border-r border-[#1e2d4a] z-20 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#1e2d4a]">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="font-bold text-white text-sm leading-tight">CivicPulse</div>
              <div className="text-[10px] text-blue-400 font-medium tracking-wider uppercase">AI Platform</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User info */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-3 border-b border-[#1e2d4a]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-white truncate">{user?.full_name}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={clsx('w-5 h-5 flex-shrink-0', isActive && 'text-blue-400')} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-2 w-1.5 h-1.5 rounded-full bg-blue-400"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* AI Assistant button */}
        <button
          onClick={() => dispatch(toggleAIAssistant())}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 mt-2"
        >
          <div className="relative flex-shrink-0">
            <Bot className="w-5 h-5 text-purple-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium whitespace-nowrap text-purple-400"
              >
                AI Assistant
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-[#1e2d4a] space-y-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Toggle button */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#1e2d4a] border border-[#2d4a7a] flex items-center justify-center text-gray-400 hover:text-white transition-colors z-30"
      >
        {sidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
    </motion.aside>
  )
}
