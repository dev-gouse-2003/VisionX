import React, { useState, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
  Upload, Mic, MicOff, AlertTriangle,
  Sparkles, X, FileText, Image, Loader2, Send, MapPin
} from 'lucide-react'
import { submitComplaint } from '@/store/slices/complaintsSlice'
import { aiService } from '@/services/api'
import { ComplaintMapPicker } from '@/components/ui/ComplaintMap'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { value: 'water', label: '💧 Water Supply', color: '#3b82f6' },
  { value: 'roads', label: '🛣️ Roads', color: '#f59e0b' },
  { value: 'electricity', label: '⚡ Electricity', color: '#eab308' },
  { value: 'healthcare', label: '🏥 Healthcare', color: '#ef4444' },
  { value: 'sanitation', label: '🗑️ Sanitation', color: '#10b981' },
  { value: 'transport', label: '🚌 Transport', color: '#8b5cf6' },
  { value: 'emergency', label: '🚨 Emergency', color: '#dc2626' },
  { value: 'public_safety', label: '🛡️ Public Safety', color: '#6366f1' },
  { value: 'education', label: '📚 Education', color: '#06b6d4' },
  { value: 'housing', label: '🏠 Housing', color: '#f97316' },
  { value: 'environment', label: '🌿 Environment', color: '#22c55e' },
  { value: 'other', label: '📋 Other', color: '#6b7280' },
]

export default function SubmitComplaint() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { submitting } = useSelector(state => state.complaints)
  const [step, setStep] = useState(1)
  const [isRecording, setIsRecording] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [files, setFiles] = useState([])

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    district: '',
    state: '',
    address: '',
    latitude: null,
    longitude: null,
    is_emergency: false,
    language: 'en',
  })

  const onDrop = useCallback(acceptedFiles => {
    setFiles(prev => [...prev, ...acceptedFiles].slice(0, 5))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'application/pdf': [] },
    maxSize: 10 * 1024 * 1024,
  })

  const analyzeWithAI = async () => {
    if (!form.description || form.description.length < 10) return
    setAnalyzing(true)
    try {
      const response = await aiService.classify(form.title + ' ' + form.description)
      setAiAnalysis(response.data)
      if (!form.category && response.data.category) {
        setForm(prev => ({ ...prev, category: response.data.category }))
      }
    } catch (e) {
      // silent fail
    } finally {
      setAnalyzing(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (form.description.length > 20) analyzeWithAI()
    }, 1500)
    return () => clearTimeout(timer)
  }, [form.description])

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.category) {
      toast.error('Please fill in all required fields')
      return
    }
    const result = await dispatch(submitComplaint({ ...form, attachments: files }))
    if (submitComplaint.fulfilled.match(result)) {
      toast.success('Complaint submitted successfully!')
      navigate('/citizen/complaints')
    } else {
      toast.error('Failed to submit complaint')
    }
  }

  const toggleRecording = () => {
    if (!isRecording) {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          setForm(prev => ({ ...prev, description: prev.description + ' ' + transcript }))
          setIsRecording(false)
        }
        recognition.onerror = () => setIsRecording(false)
        recognition.onend = () => setIsRecording(false)
        recognition.start()
        setIsRecording(true)
      } else {
        toast.error('Voice recognition not supported in this browser')
      }
    } else {
      setIsRecording(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Submit a Complaint</h1>
        <p className="text-gray-400 text-sm mt-1">AI will automatically classify and prioritize your complaint</p>
      </div>

      {/* Emergency toggle */}
      <motion.div
        animate={{ borderColor: form.is_emergency ? '#ef4444' : '#1e2d4a' }}
        className="glass-card-dark p-4 border cursor-pointer"
        onClick={() => setForm(prev => ({ ...prev, is_emergency: !prev.is_emergency }))}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${form.is_emergency ? 'bg-red-500/20' : 'bg-white/5'}`}>
              <AlertTriangle className={`w-5 h-5 ${form.is_emergency ? 'text-red-400' : 'text-gray-500'}`} />
            </div>
            <div>
              <div className="text-white font-medium text-sm">Emergency Complaint</div>
              <div className="text-gray-500 text-xs">Mark if this requires immediate attention</div>
            </div>
          </div>
          <div className={`w-12 h-6 rounded-full transition-colors ${form.is_emergency ? 'bg-red-500' : 'bg-white/10'} relative`}>
            <motion.div
              animate={{ x: form.is_emergency ? 24 : 2 }}
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
            />
          </div>
        </div>
      </motion.div>

      {/* Main form */}
      <div className="glass-card-dark p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="text-sm text-gray-300 font-medium mb-2 block">
            Complaint Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="Brief title of your complaint..."
            className="input-dark w-full"
            maxLength={200}
          />
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-300 font-medium">
              Description <span className="text-red-400">*</span>
            </label>
            <button
              type="button"
              onClick={toggleRecording}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${
                isRecording
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              {isRecording ? 'Stop Recording' : 'Voice Input'}
            </button>
          </div>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Describe your complaint in detail. Include location, time, and impact..."
            className="input-dark w-full h-32 resize-none"
            maxLength={2000}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-600">{form.description.length}/2000</span>
            {analyzing && (
              <span className="text-xs text-blue-400 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> AI analyzing...
              </span>
            )}
          </div>
        </div>

        {/* AI Analysis Result */}
        <AnimatePresence>
          {aiAnalysis && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-sm font-medium">AI Analysis</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <div className="text-gray-400 mb-1">Category</div>
                  <div className="text-white font-medium capitalize">{aiAnalysis.category?.replace('_', ' ')}</div>
                  <div className="text-gray-500">{Math.round((aiAnalysis.confidence || 0) * 100)}% confident</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <div className="text-gray-400 mb-1">Priority</div>
                  <div className={`font-medium capitalize ${
                    aiAnalysis.priority === 'critical' ? 'text-red-400' :
                    aiAnalysis.priority === 'high' ? 'text-orange-400' :
                    aiAnalysis.priority === 'medium' ? 'text-yellow-400' : 'text-green-400'
                  }`}>{aiAnalysis.priority}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <div className="text-gray-400 mb-1">Sentiment</div>
                  <div className="text-white font-medium capitalize">{aiAnalysis.sentiment}</div>
                </div>
              </div>
              {aiAnalysis.summary && (
                <div className="mt-3 text-xs text-gray-400">
                  <span className="text-gray-500">AI Summary: </span>{aiAnalysis.summary}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category */}
        <div>
          <label className="text-sm text-gray-300 font-medium mb-2 block">
            Category <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setForm({ ...form, category: cat.value })}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                  form.category === cat.value
                    ? 'border-blue-500/50 bg-blue-500/20 text-white'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-300 font-medium mb-2 block">District</label>
            <input type="text" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })}
              placeholder="Your district" className="input-dark w-full" />
          </div>
          <div>
            <label className="text-sm text-gray-300 font-medium mb-2 block">State</label>
            <input type="text" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}
              placeholder="Your state" className="input-dark w-full" />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-300 font-medium mb-2 block">Address / Location Details</label>
          <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
            placeholder="Specific address or landmark" className="input-dark w-full" />
        </div>

        {/* Map Location Picker */}
        <div>
          <label className="text-sm text-gray-300 font-medium mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            Pin Location on Map
            <span className="text-gray-500 font-normal text-xs">(optional but recommended)</span>
          </label>
          <ComplaintMapPicker
            latitude={form.latitude}
            longitude={form.longitude}
            onLocationChange={({ latitude, longitude }) =>
              setForm(prev => ({ ...prev, latitude, longitude }))
            }
            height="280px"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="text-sm text-gray-300 font-medium mb-2 block">
            Attachments <span className="text-gray-500">(optional, max 5 files)</span>
          </label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-[#1e2d4a] hover:border-[#2d4a7a]'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">
              {isDragActive ? 'Drop files here...' : 'Drag & drop or click to upload'}
            </p>
            <p className="text-gray-600 text-xs mt-1">Images, PDFs up to 10MB each</p>
          </div>
          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2">
                  {file.type.startsWith('image/') ? <Image className="w-4 h-4 text-blue-400" /> : <FileText className="w-4 h-4 text-gray-400" />}
                  <span className="text-sm text-gray-300 flex-1 truncate">{file.name}</span>
                  <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)}KB</span>
                  <button onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-gray-500 hover:text-red-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={submitting || !form.title || !form.description || !form.category}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
          ) : (
            <><Send className="w-4 h-4" /> Submit Complaint</>
          )}
        </motion.button>
      </div>
    </div>
  )
}
