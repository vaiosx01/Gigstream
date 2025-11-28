// src/components/gigstream/SDSJobsIndicator.tsx - Indicator for Data Streams integration
'use client'

import { Zap, Database } from 'lucide-react'
import { useSDSJobs } from '@/hooks/useSDSJobs'
import { motion } from 'framer-motion'

interface SDSJobsIndicatorProps {
  publisher?: `0x${string}`
  showCount?: boolean
}

export default function SDSJobsIndicator({ publisher, showCount = true }: SDSJobsIndicatorProps) {
  const { jobs, isLoading } = useSDSJobs(publisher)

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-white/50">
        <div className="w-3 h-3 border-2 border-somnia-cyan border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono">Loading SDS...</span>
      </div>
    )
  }

  if (jobs.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-somnia-cyan/20 to-mx-green/20 rounded-lg border border-somnia-cyan/30"
      title={`${jobs.length} job${jobs.length !== 1 ? 's' : ''} available in Somnia Data Streams`}
    >
      <Database className="w-4 h-4 text-somnia-cyan" />
      {showCount && (
        <span className="text-xs font-mono text-white">
          {jobs.length} in SDS
        </span>
      )}
      <Zap className="w-3 h-3 text-mx-green animate-pulse" />
    </motion.div>
  )
}

