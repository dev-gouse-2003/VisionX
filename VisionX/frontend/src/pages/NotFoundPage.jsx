import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#060b14] flex items-center justify-center">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-8xl font-black gradient-text mb-4"
        >
          404
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <Home className="w-4 h-4" /> Go Home
          </motion.button>
        </Link>
      </div>
    </div>
  )
}
