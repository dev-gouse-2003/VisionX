import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, Zap, ArrowRight } from 'lucide-react'
import { login, clearError } from '@/store/slices/authSlice'
import toast from 'react-hot-toast'

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@civicpulse.gov', password: 'Admin@123', color: 'from-blue-600 to-purple-600' },
  { role: 'Officer', email: 'officer@civicpulse.gov', password: 'Officer@123', color: 'from-green-600 to-teal-600' },
  { role: 'Citizen', email: 'citizen@civicpulse.gov', password: 'Citizen@123', color: 'from-orange-600 to-pink-600' },
]

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector(state => state.auth)
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  const redirectByRole = (user) => {
    if (user?.role === 'admin') navigate('/admin/dashboard')
    else if (user?.role === 'officer') navigate('/officer/dashboard')
    else navigate('/citizen/dashboard')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(clearError())
    const result = await dispatch(login(form))
    if (login.fulfilled.match(result)) {
      toast.success('Welcome back!')
      redirectByRole(result.payload.user)
    } else {
      toast.error(result.payload?.detail || 'Login failed')
    }
  }

  const handleDemoLogin = async (account) => {
    dispatch(clearError())
    const result = await dispatch(login({ email: account.email, password: account.password }))
    if (login.fulfilled.match(result)) {
      toast.success(`Logged in as ${account.role}`)
      redirectByRole(result.payload.user)
    } else {
      toast.error(result.payload?.detail || 'Login failed')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-dark p-8"
    >
      <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
      <p className="text-gray-500 text-sm mb-6">Sign in to your governance account</p>

      {/* Demo accounts */}
      <div className="mb-6">
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Quick Demo Access</p>
        <div className="grid grid-cols-3 gap-2">
          {DEMO_ACCOUNTS.map(account => (
            <button
              key={account.role}
              onClick={() => handleDemoLogin(account)}
              disabled={loading}
              className={`bg-gradient-to-r ${account.color} p-0.5 rounded-xl group`}
            >
              <div className="bg-[#0a0f1e] rounded-[10px] px-2 py-2 text-center group-hover:bg-transparent transition-colors">
                <div className="text-xs font-semibold text-white">{account.role}</div>
                <div className="text-[10px] text-gray-400 group-hover:text-white transition-colors">Demo</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-[#1e2d4a]" />
        <span className="text-gray-600 text-xs">or sign in manually</span>
        <div className="flex-1 h-px bg-[#1e2d4a]" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="input-dark w-full pl-10"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="input-dark w-full pl-10 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm"
          >
            {error.detail || 'Invalid credentials'}
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Sign In <ArrowRight className="w-4 h-4" /></>
          )}
        </motion.button>
      </form>

      <p className="text-center text-gray-500 text-sm mt-6">
        New citizen?{' '}
        <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
          Register here
        </Link>
      </p>
    </motion.div>
  )
}
