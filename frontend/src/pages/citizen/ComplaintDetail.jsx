import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, MapPin, User, Building2, AlertTriangle, Bot } from 'lucide-react'
import { fetchComplaintById } from '@/store/slices/complaintsSlice'
import { StatusBadge, PriorityBadge, CategoryBadge, SentimentBadge } from '@/components/ui/StatusBadge'
import { ComplaintMapView } from '@/components/ui/ComplaintMap'
import WorkStatusPanel from '@/components/ui/WorkStatusPanel'
import { format, formatDistanceToNow } from 'date-fns'

export default function ComplaintDetail() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { current: complaint, loading } = useSelector(state => state.complaints)

  useEffect(() => {
    dispatch(fetchComplaintById(id))
  }, [id, dispatch])

  if (loading || !complaint) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48 rounded-xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header */}
      <div className="glass-card-dark p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-blue-400 text-sm bg-blue-500/10 px-2 py-0.5 rounded">
                {complaint.ticket_number}
              </span>
              {complaint.is_emergency && (
                <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2 py-0.5 animate-pulse">
                  🚨 Emergency
                </span>
              )}
              {complaint.is_spam && (
                <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full px-2 py-0.5">
                  ⚠️ Flagged
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-white">{complaint.title}</h1>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={complaint.status} size="md" />
            <PriorityBadge priority={complaint.priority} size="md" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <CategoryBadge category={complaint.category} />
          <SentimentBadge sentiment={complaint.sentiment} />
        </div>

        <p className="text-gray-300 leading-relaxed">{complaint.description}</p>

        {/* AI Summary */}
        {complaint.ai_summary && (
          <div className="mt-4 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 text-sm font-medium">AI Summary</span>
            </div>
            <p className="text-gray-300 text-sm">{complaint.ai_summary}</p>
          </div>
        )}

        {/* Delay prediction */}
        {complaint.delay_predicted && (
          <div className="mt-4 bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0" />
            <div>
              <div className="text-orange-400 text-sm font-medium">Delay Risk Detected</div>
              <div className="text-gray-400 text-xs">
                AI predicts {Math.round((complaint.delay_probability || 0) * 100)}% probability of delay
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Work Status Panel — officers & admins can update, citizens see read-only */}
      <WorkStatusPanel
        complaint={complaint}
        onUpdated={() => dispatch(fetchComplaintById(id))}
      />

      {/* Details grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Info */}
        <div className="glass-card-dark p-5 space-y-4">
          <h3 className="text-white font-semibold">Complaint Details</h3>
          {[
            { icon: Clock, label: 'Submitted', value: format(new Date(complaint.created_at), 'dd MMM yyyy, HH:mm') },
            { icon: MapPin, label: 'Location', value: [complaint.district, complaint.state].filter(Boolean).join(', ') || 'Not specified' },
            { icon: Building2, label: 'Department', value: complaint.department_detail?.name || 'Pending Assignment' },
            { icon: User, label: 'Assigned Officer', value: complaint.officer_detail?.full_name || 'Not assigned' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <item.icon className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-500">{item.label}</div>
                <div className="text-sm text-white">{item.value}</div>
              </div>
            </div>
          ))}
          {complaint.sla_deadline && (
            <div className="flex items-start gap-3">
              <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${complaint.is_overdue ? 'text-red-400' : 'text-gray-500'}`} />
              <div>
                <div className="text-xs text-gray-500">SLA Deadline</div>
                <div className={`text-sm ${complaint.is_overdue ? 'text-red-400' : 'text-white'}`}>
                  {format(new Date(complaint.sla_deadline), 'dd MMM yyyy, HH:mm')}
                  {complaint.is_overdue && ' — Overdue!'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="glass-card-dark p-5">
          <h3 className="text-white font-semibold mb-4">Activity Timeline</h3>
          {complaint.history && complaint.history.length > 0 ? (
            <div className="space-y-4">
              {complaint.history.map((h, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-1" />
                    {i < complaint.history.length - 1 && <div className="w-0.5 flex-1 bg-[#1e2d4a] mt-1" />}
                  </div>
                  <div className="pb-4">
                    <div className="text-sm text-white">
                      {h.old_status ? (
                        <><span className="text-gray-400">{h.old_status}</span> → <span className="text-blue-400">{h.new_status}</span></>
                      ) : (
                        <span className="text-green-400">Complaint submitted</span>
                      )}
                    </div>
                    {h.comment && <div className="text-xs text-gray-400 mt-0.5">{h.comment}</div>}
                    <div className="text-xs text-gray-600 mt-0.5">
                      {formatDistanceToNow(new Date(h.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No activity yet</p>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="glass-card-dark p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-400" />
          Complaint Location
        </h3>
        <ComplaintMapView
          latitude={complaint.latitude}
          longitude={complaint.longitude}
          address={complaint.address}
          district={complaint.district}
          state={complaint.state}
          height="320px"
        />
        {/* Location text details */}
        <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
          {complaint.address && (
            <div className="bg-white/5 rounded-lg p-2">
              <div className="text-gray-500 mb-0.5">Address</div>
              <div className="text-white">{complaint.address}</div>
            </div>
          )}
          {complaint.district && (
            <div className="bg-white/5 rounded-lg p-2">
              <div className="text-gray-500 mb-0.5">District</div>
              <div className="text-white">{complaint.district}</div>
            </div>
          )}
          {complaint.state && (
            <div className="bg-white/5 rounded-lg p-2">
              <div className="text-gray-500 mb-0.5">State</div>
              <div className="text-white">{complaint.state}</div>
            </div>
          )}
        </div>
      </div>

      {/* Attachments */}
      {complaint.attachments && complaint.attachments.length > 0 && (
        <div className="glass-card-dark p-5">
          <h3 className="text-white font-semibold mb-4">Attachments</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {complaint.attachments.map((att, i) => (
              <a
                key={i}
                href={att.file}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-colors text-center"
              >
                {att.file_type?.startsWith('image/') ? (
                  <img src={att.file} alt={att.file_name} className="w-full h-20 object-cover rounded-lg mb-2" />
                ) : (
                  <div className="w-full h-20 bg-white/5 rounded-lg mb-2 flex items-center justify-center">
                    <span className="text-2xl">📄</span>
                  </div>
                )}
                <div className="text-xs text-gray-400 truncate">{att.file_name}</div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
