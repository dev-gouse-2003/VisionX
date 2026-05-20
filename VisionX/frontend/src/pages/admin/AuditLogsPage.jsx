import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Search } from 'lucide-react'
import api from '@/services/api'
import { formatDistanceToNow } from 'date-fns'

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/auth/audit-logs/')
        setLogs(res.data.results || res.data)
      } catch (e) {}
      finally { setLoading(false) }
    }
    fetchLogs()
  }, [])

  const filtered = logs.filter(l =>
    l.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.resource?.toLowerCase().includes(search.toLowerCase()) ||
    l.action?.toLowerCase().includes(search.toLowerCase())
  )

  const actionColors = {
    login: 'text-green-400 bg-green-500/10',
    logout: 'text-gray-400 bg-gray-500/10',
    create: 'text-blue-400 bg-blue-500/10',
    update: 'text-yellow-400 bg-yellow-500/10',
    delete: 'text-red-400 bg-red-500/10',
    view: 'text-purple-400 bg-purple-500/10',
    export: 'text-cyan-400 bg-cyan-500/10',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-gray-400 text-sm mt-1">Complete activity trail for security compliance</p>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
          <Shield className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-xs font-medium">Audit Active</span>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search logs..." className="input-dark w-full pl-10" />
      </div>

      <div className="glass-card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-dark">
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>IP Address</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j}><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.map((log, i) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <td className="text-white">{log.user_name || 'System'}</td>
                  <td>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${actionColors[log.action] || 'text-gray-400 bg-gray-500/10'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="text-gray-400 text-xs font-mono">{log.resource}</td>
                  <td className="text-gray-500 text-xs font-mono">{log.ip_address || '—'}</td>
                  <td className="text-gray-500 text-xs">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">No audit logs found</div>
        )}
      </div>
    </div>
  )
}
