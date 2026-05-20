import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ArrowRight } from 'lucide-react'
import { register, clearError } from '@/store/slices/authSlice'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector(state => state.auth)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', username: '',
    phone: '', password: '', password2: '', district: '', state: '', address: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(clearError())
    if (form.password !== form.password2) {
      toast.error('Passwords do not match')
      return
    }
    const result = await dispatch(register(form))
    if (register.fulfilled.match(result)) {
      toast.success('Registration successful! Welcome to CivicPulse AI')
      navigate('/citizen/dashboard')
    } else {
      const errors = result.payload
      if (errors) {
        const firstError = Object.values(errors)[0]
        toast.error(Array.isArray(firstError) ? firstError[0] : firstError)
      }
    }
  }

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-dark p-8"
    >
      <h2 className="text-xl font-bold text-white mb-1">Create Account</h2>
      <p className="text-gray-500 text-sm mb-6">Register as a citizen to submit complaints</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">First Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" value={form.first_name} onChange={update('first_name')}
                placeholder="John" className="input-dark w-full pl-10" required />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Last Name</label>
            <input type="text" value={form.last_name} onChange={update('last_name')}
              placeholder="Doe" className="input-dark w-full" required />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="email" value={form.email} onChange={update('email')}
              placeholder="you@example.com" className="input-dark w-full pl-10" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Username</label>
            <input type="text" value={form.username} onChange={update('username')}
              placeholder="johndoe" className="input-dark w-full" required />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="tel" value={form.phone} onChange={update('phone')}
                placeholder="+91 9876543210" className="input-dark w-full pl-10" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">District</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" value={form.district} onChange={update('district')}
                placeholder="Your district" className="input-dark w-full pl-10" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">State</label>
            <input type="text" value={form.state} onChange={update('state')}
              placeholder="Your state" className="input-dark w-full" />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={update('password')}
              placeholder="Min 8 characters" className="input-dark w-full pl-10 pr-10" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="password" value={form.password2} onChange={update('password2')}
              placeholder="Repeat password" className="input-dark w-full pl-10" required />
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm"
          >
            {typeof error === 'object' ? Object.values(error).flat().join(', ') : error}
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
            <>Create Account <ArrowRight className="w-4 h-4" /></>
          )}
        </motion.button>
      </form>

      <p className="text-center text-gray-500 text-sm mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
      </p>
    </motion.div>
  )
}
