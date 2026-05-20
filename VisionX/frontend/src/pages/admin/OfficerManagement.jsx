import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, X, UserCheck, TrendingUp, Star, Mail, Building2, RefreshCw } from 'lucide-react'
import { fetchOfficerPerformance } from '@/store/slices/analyticsSlice'
import api from '@/services/api'
import toast from 'react-hot-toast'

export default function OfficerManagement() {
  const dispatch = useDispatch()
  const { officers } = useSelector(state => state.analytics)
  const [showModal, setShowModal] = useState(false)
  const [departments, setDepartments] = useState([])
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', username: '',
    password: 'Officer@123', employee_id: '', designation: '',
    department_id: '', district: '', state: '',
  })

  useEffect(() => {
    dispatch(fetchOfficerPerformance())
    api.get('/departments/').then(r => setDepartments(r.data?.results || r.data || [])).catch(() => {})
  }, [])

  const update = f => e => setForm({ ...form, [f]: e.target.value })

  const handleCreate = async () => {
    if (!form.first_name || !form.last_name || !form.email || !form.employee_id) {
      toast.error('Please fill all required fields')
      return
    }
    setCreating(true)
    try {
      // 1. Create user
      await api.post('/auth/users/', {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        username: form.username || form.email.split('@')[0],
        password: form.password,
        role: 'officer',
      })
      toast.success(`Officer ${form.first_name} ${form.last_name} created!`)
      setShowModal(false)
      setForm({ first_name: '', last_name: '', email: '', username: '', password: 'Officer@123', employee_id: '', designation: '', department_id: '', district: '', state: '' })
      dispatch(fetchOfficerPerformance())
    } catch (e) {
      const msg = e.response?.data
      toast.error(typeof msg === 'object' ? Object.values(msg).flat().join(', ') : 'Failed to create officer')
    }
    setCreating(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Officer Management</h1>
          <p className="text-gray-400 text-sm mt-1">{officers.length} officers</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => dispatch(fetchOfficerPerformance())}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Officer
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Officers', value: officers.length, color: 'text-blue-400' },
          { label: 'Avg Performance', value: officers.length ? (officers.reduce((s, o) => s + (o.performance_score || 0), 0) / officers.length).toFixed(1) : '0', color: 'text-yellow-400' },
          { label: 'Total Resolved', value: officers.reduce((s, o) => s + (o.resolved || 0), 0), color: 'text-green-400' },
          { label: 'Active Cases', value: officers.reduce((s, o) => s + (o.active_complaints || 0), 0), color: 'text-orange-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card-dark p-4"
          >
            <div className="text-gray-400 text-xs mb-1">{stat.label}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Officers Table */}
      <div className="glass-card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-dark">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Officer</th>
                <th>Department</th>
                <th>Active</th>
                <th>Total</th>
                <th>Resolved</th>
                <th>Resolution Rate</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {officers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    No officers found. Add officers using the button above.
                  </td>
                </tr>
              ) : officers.map((officer, i) => (
                <motion.tr
                  key={officer.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td>
                    <span className={`text-lg font-bold ${
                      i === 0 ? 'text-yellow-400' :
                      i === 1 ? 'text-gray-300' :
                      i === 2 ? 'text-orange-400' : 'text-gray-600'
                    }`}>
                      #{i + 1}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                        {officer.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{officer.name}</div>
                        <div className="text-gray-500 text-xs">{officer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-gray-400 text-sm">{officer.department || '—'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`font-semibold text-sm ${
                      officer.active_complaints > 10 ? 'text-red-400' :
                      officer.active_complaints > 5 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {officer.active_complaints}
                    </span>
                  </td>
                  <td className="text-gray-300 text-sm">{officer.total_assigned}</td>
                  <td className="text-green-400 text-sm font-medium">{officer.resolved}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-green-500"
                          style={{ width: `${officer.resolution_rate || 0}%` }}
                        />
                      </div>
                      <span className="text-white text-xs">{officer.resolution_rate || 0}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <Star className={`w-3.5 h-3.5 ${
                        officer.performance_score >= 80 ? 'text-yellow-400' :
                        officer.performance_score >= 60 ? 'text-orange-400' : 'text-red-400'
                      }`} />
                      <span className={`text-sm font-bold ${
                        officer.performance_score >= 80 ? 'text-green-400' :
                        officer.performance_score >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {officer.performance_score?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Officer Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#0d1526] border border-[#1e2d4a] rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Add New Officer</h3>
                    <p className="text-gray-500 text-xs">Create a new officer account</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">First Name <span className="text-red-400">*</span></label>
                    <input value={form.first_name} onChange={update('first_name')} placeholder="John" className="input-dark w-full" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">Last Name <span className="text-red-400">*</span></label>
                    <input value={form.last_name} onChange={update('last_name')} placeholder="Smith" className="input-dark w-full" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Email <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="email" value={form.email} onChange={update('email')} placeholder="officer@civicpulse.gov" className="input-dark w-full pl-10" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">Employee ID <span className="text-red-400">*</span></label>
                    <input value={form.employee_id} onChange={update('employee_id')} placeholder="OFF006" className="input-dark w-full" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">Designation</label>
                    <input value={form.designation} onChange={update('designation')} placeholder="Field Officer" className="input-dark w-full" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Department</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select value={form.department_id} onChange={update('department_id')} className="input-dark w-full pl-10">
                      <option value="">Select Department</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">District</label>
                    <input value={form.district} onChange={update('district')} placeholder="Central District" className="input-dark w-full" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">State</label>
                    <input value={form.state} onChange={update('state')} placeholder="State" className="input-dark w-full" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Default Password</label>
                  <input value={form.password} onChange={update('password')} className="input-dark w-full" />
                  <p className="text-xs text-gray-600 mt-1">Officer can change this after first login</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Plus className="w-4 h-4" /> Create Officer</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
