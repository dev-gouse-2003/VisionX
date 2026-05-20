import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import clsx from 'clsx'

// Hook must always be called — never conditionally
function useCountUp(target, duration = 1500, enabled = true) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!enabled || typeof target !== 'number') {
      setCount(target || 0)
      return
    }
    if (target === 0) { setCount(0); return }
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress >= 1) { setCount(target); clearInterval(timer) }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, enabled])
  return count
}

const COLOR_MAP = {
  blue:   { bg: 'from-blue-600/20 to-blue-600/5',     border: 'border-blue-500/20',   icon: 'bg-blue-500/20 text-blue-400',   text: 'text-blue-400',   glow: 'shadow-blue-500/20' },
  green:  { bg: 'from-green-600/20 to-green-600/5',   border: 'border-green-500/20',  icon: 'bg-green-500/20 text-green-400', text: 'text-green-400',  glow: 'shadow-green-500/20' },
  red:    { bg: 'from-red-600/20 to-red-600/5',       border: 'border-red-500/20',    icon: 'bg-red-500/20 text-red-400',     text: 'text-red-400',    glow: 'shadow-red-500/20' },
  orange: { bg: 'from-orange-600/20 to-orange-600/5', border: 'border-orange-500/20', icon: 'bg-orange-500/20 text-orange-400', text: 'text-orange-400', glow: 'shadow-orange-500/20' },
  purple: { bg: 'from-purple-600/20 to-purple-600/5', border: 'border-purple-500/20', icon: 'bg-purple-500/20 text-purple-400', text: 'text-purple-400', glow: 'shadow-purple-500/20' },
  yellow: { bg: 'from-yellow-600/20 to-yellow-600/5', border: 'border-yellow-500/20', icon: 'bg-yellow-500/20 text-yellow-400', text: 'text-yellow-400', glow: 'shadow-yellow-500/20' },
  cyan:   { bg: 'from-cyan-600/20 to-cyan-600/5',     border: 'border-cyan-500/20',   icon: 'bg-cyan-500/20 text-cyan-400',   text: 'text-cyan-400',   glow: 'shadow-cyan-500/20' },
}

export default function KPICard({
  title, value, icon: Icon, color = 'blue',
  trend, trendValue, suffix = '', prefix = '',
  subtitle, animate = true, glowing = false, index = 0,
}) {
  // Always call hook — pass enabled flag instead of conditional call
  const animatedValue = useCountUp(
    typeof value === 'number' ? value : 0,
    1500,
    animate && typeof value === 'number'
  )
  const displayValue = animate && typeof value === 'number' ? animatedValue : value

  const c = COLOR_MAP[color] || COLOR_MAP.blue

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className={clsx(
        'relative overflow-hidden rounded-2xl border p-5 cursor-default',
        `bg-gradient-to-br ${c.bg}`,
        c.border,
        glowing && `shadow-lg ${c.glow}`
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">{title}</p>
          <div className="flex items-baseline gap-1">
            {prefix && <span className={clsx('text-lg font-semibold', c.text)}>{prefix}</span>}
            <span className="text-3xl font-bold text-white tabular-nums">
              {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
            </span>
            {suffix && <span className={clsx('text-sm font-medium', c.text)}>{suffix}</span>}
          </div>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <div className={clsx(
              'flex items-center gap-1 mt-2 text-xs font-medium',
              trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'
            )}>
              {trend > 0 ? <TrendingUp className="w-3 h-3" /> :
               trend < 0 ? <TrendingDown className="w-3 h-3" /> :
               <Minus className="w-3 h-3" />}
              <span>{Math.abs(trendValue || trend)}% from last month</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', c.icon)}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="absolute inset-0 shimmer opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  )
}
