import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Search, Bot, Sun, Moon, ChevronDown, User, Settings, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { logout } from '@/store/slices/authSlice'
import { toggleAIAssistant } from '@/store/slices/uiSlice'
import { markAllRead } from '@/store/slices/notificationsSlice'
import { formatDistanceToNow } from 'date-fns'

export default function Topbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const { unreadCount, list: notifications } = useSelector(state => state.notifications)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/login')
  }

  const roleColors = {
    admin: 'from-blue-600 to-purple-600',
    officer: 'from-green-600 to-teal-600',
    citizen: 'from-orange-600 to-pink-600',
  }

  return (
    <header className="h-16 bg-[#0a0f1e]/80 backdrop-blur-md border-b border-[#1e2d4a] flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Left: Page title area */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 bg-[#0d1526] border border-[#1e2d4a] rounded-xl px-4 py-2 w-64">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search complaints..."
            className="bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none w-full"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* AI Assistant button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => dispatch(toggleAIAssistant())}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl px-3 py-2 text-purple-400 hover:text-purple-300 transition-colors"
        >
          <Bot className="w-4 h-4" />
          <span className="text-xs font-medium hidden sm:block">AI Assistant</span>
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
        </motion.button>

        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false) }}
            className="relative w-9 h-9 rounded-xl bg-[#0d1526] border border-[#1e2d4a] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-12 w-80 bg-[#0d1526] border border-[#1e2d4a] rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2d4a]">
                  <span className="font-semibold text-white text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => dispatch(markAllRead())}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                      No notifications
                    </div>
                  ) : (
                    notifications.slice(0, 10).map(n => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 border-b border-[#1e2d4a]/50 hover:bg-white/5 transition-colors ${!n.is_read ? 'bg-blue-500/5' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.is_read ? 'bg-blue-400' : 'bg-gray-600'}`} />
                          <div>
                            <div className="text-sm font-medium text-white">{n.title}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{n.message}</div>
                            <div className="text-xs text-gray-600 mt-1">
                              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false) }}
            className="flex items-center gap-2 bg-[#0d1526] border border-[#1e2d4a] rounded-xl px-3 py-2 hover:border-[#2d4a7a] transition-colors"
          >
            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${roleColors[user?.role] || 'from-blue-600 to-purple-600'} flex items-center justify-center text-xs font-bold text-white`}>
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <span className="text-sm text-gray-300 hidden sm:block">{user?.full_name?.split(' ')[0]}</span>
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-12 w-48 bg-[#0d1526] border border-[#1e2d4a] rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-[#1e2d4a]">
                  <div className="text-sm font-medium text-white">{user?.full_name}</div>
                  <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition-colors">
                    <User className="w-4 h-4" /> Profile
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition-colors">
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Click outside handler */}
      {(showNotifications || showProfile) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setShowNotifications(false); setShowProfile(false) }}
        />
      )}
    </header>
  )
}
