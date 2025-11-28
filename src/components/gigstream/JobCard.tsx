// src/components/gigstream/JobCard.tsx - Job Card Component with Onchain Integration
'use client'

import { motion } from 'framer-motion'
import { MapPin, DollarSign, Clock, User, CheckCircle, XCircle, Zap, Database } from 'lucide-react'
import { formatEther } from 'viem'
import { useJob } from '@/hooks/useJob'
import { useGigStream } from '@/hooks/useGigStream'
import { useAccount } from 'wagmi'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { useState, useEffect } from 'react'

interface JobCardProps {
  jobId: bigint
  onClick?: () => void
}

export default function JobCard({ jobId, onClick }: JobCardProps) {
  const { job, isLoading } = useJob(jobId)
  const { address } = useAccount()
  const [isInSDS, setIsInSDS] = useState(false)

  // Check if this job is in Data Streams (optional enhancement)
  useEffect(() => {
    if (!job?.employer) return

    const checkSDS = async () => {
      try {
        const response = await fetch(`/api/sds/read-jobs?publisher=${job.employer}&limit=100`)
        if (response.ok) {
          const data = await response.json()
          const jobInSDS = data.jobs?.some((sdsJob: any) => 
            sdsJob.jobId?.toString() === jobId.toString()
          )
          setIsInSDS(jobInSDS || false)
        }
      } catch (error) {
        // Silently fail - SDS check is optional
      }
    }

    checkSDS()
  }, [job?.employer, jobId])

  if (isLoading || !job) {
    return (
      <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-6 border border-white/10 animate-pulse">
        <div className="h-6 bg-white/10 rounded mb-4" />
        <div className="space-y-2">
          <div className="h-4 bg-white/10 rounded w-3/4" />
          <div className="h-4 bg-white/10 rounded w-1/2" />
        </div>
      </div>
    )
  }

  const isEmployer = address?.toLowerCase() === job.employer.toLowerCase()
  const isWorker = address?.toLowerCase() === job.worker.toLowerCase()
  const isAssigned = job.worker !== '0x0000000000000000000000000000000000000000'
  const deadlineDate = new Date(Number(job.deadline) * 1000)
  const createdAtDate = new Date(Number(job.createdAt) * 1000)

  return (
    <Link href={`/gigstream/job/${jobId.toString()}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className="backdrop-blur-xl bg-white/5 rounded-3xl p-6 border border-white/10 shadow-neural-glow hover:shadow-neural-glow-lg transition-all duration-300 cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex-1">{job.title}</h3>
          <div className="flex items-center space-x-2">
            {isInSDS && (
              <div title="Available in Somnia Data Streams">
                <Database className="w-4 h-4 text-somnia-cyan" />
              </div>
            )}
            {job.completed && (
              <CheckCircle className="w-5 h-5 text-mx-green" />
            )}
            {job.cancelled && (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            {!job.completed && !job.cancelled && !isAssigned && (
              <div className="w-3 h-3 bg-mx-green rounded-full animate-pulse" />
            )}
            {isAssigned && !job.completed && (
              <User className="w-5 h-5 text-somnia-cyan" />
            )}
          </div>
        </div>

        <div className="space-y-2 text-white/70 font-mono text-sm mb-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-mx-green font-bold">{formatEther(job.reward)} STT</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>
              {job.deadline > BigInt(Math.floor(Date.now() / 1000))
                ? `Deadline: ${formatDistanceToNow(deadlineDate, { addSuffix: true, locale: enUS })}`
                : 'Deadline passed'}
            </span>
          </div>
          {isAssigned && (
            <div className="flex items-center space-x-2 text-somnia-cyan">
              <User className="w-4 h-4" />
              <span>Assigned to: {job.worker.slice(0, 6)}...{job.worker.slice(-4)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="text-xs text-white/50 font-mono">
            {formatDistanceToNow(createdAtDate, { addSuffix: true, locale: enUS })}
          </div>
          <div className="flex items-center space-x-2">
            {isEmployer && !job.completed && !job.cancelled && (
              <span className="text-xs bg-somnia-purple/30 px-2 py-1 rounded-full text-white">
                My Job
              </span>
            )}
            {isWorker && !job.completed && (
              <span className="text-xs bg-mx-green/30 px-2 py-1 rounded-full text-white">
                Assigned
              </span>
            )}
            {!isEmployer && !isWorker && !isAssigned && !job.completed && !job.cancelled && (
              <span className="text-xs bg-somnia-cyan/30 px-2 py-1 rounded-full text-white flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>Available</span>
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

