// src/app/gigstream/my-jobs/page.tsx - My Jobs with all onchain functions
'use client'

import { useState, useEffect } from 'react'
import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  Send, 
  Handshake, 
  Zap, 
  Plus,
  Briefcase,
  UserCheck,
  AlertCircle,
  ArrowRight,
  X,
  CheckCircle2
} from 'lucide-react'
import { formatEther } from 'viem'
import { useAccount } from 'wagmi'
import { useGigStream } from '@/hooks/useGigStream'
import { useJob } from '@/hooks/useJob'
import { useJobBids } from '@/hooks/useJobBids'
import { useToast } from '@/components/ui/use-toast'
import Navbar from '@/components/somnia/Navbar'
import Footer from '@/components/somnia/Footer'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { enUS } from 'date-fns/locale'

export default function MyJobsPage() {
  const { address, isConnected } = useAccount()
  const { 
    userJobIds, 
    workerJobIds, 
    placeBid, 
    acceptBid, 
    completeJob, 
    cancelJob,
    isPlacingBid,
    isAcceptingBid,
    isCompletingJob,
    isCancellingJob,
    reputation,
    refetch
  } = useGigStream()
  const { showToast } = useToast()
  
  // Track loading state
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const [selectedJobId, setSelectedJobId] = useState<bigint | null>(null)
  const [bidAmount, setBidAmount] = useState('')
  const [showBidForm, setShowBidForm] = useState<bigint | null>(null)
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set())

  // Fetch all jobs - combine user jobs and worker jobs, removing duplicates
  const allJobIds = React.useMemo(() => {
    const userJobs = userJobIds || []
    const workerJobs = workerJobIds || []
    const combined = [...userJobs]
    
    // Add worker jobs that are not already in user jobs
    workerJobs.forEach(id => {
      if (!combined.some(jobId => jobId.toString() === id.toString())) {
        combined.push(id)
      }
    })
    
    // Sort by job ID (newest first)
    combined.sort((a, b) => {
      const aNum = Number(a)
      const bNum = Number(b)
      return bNum - aNum
    })
    
    return combined
  }, [userJobIds, workerJobIds])

  // Debug: Log job counts when they change
  useEffect(() => {
    if (isConnected && address) {
      console.log('[My Jobs] Job counts:', {
        userJobs: userJobIds?.length || 0,
        workerJobs: workerJobIds?.length || 0,
        total: allJobIds.length
      })
    }
  }, [userJobIds, workerJobIds, allJobIds.length, isConnected, address])

  // Auto-refresh jobs periodically
  useEffect(() => {
    if (!isConnected || !address) return

    // Initial refetch
    const doRefetch = async () => {
      setIsRefreshing(true)
      try {
        await refetch()
      } finally {
        setIsRefreshing(false)
      }
    }
    
    doRefetch()

    // Set up interval to refetch every 15 seconds
    const interval = setInterval(() => {
      doRefetch()
    }, 15000)

    return () => clearInterval(interval)
  }, [isConnected, address, refetch])

  const toggleExpand = (jobId: string) => {
    const newExpanded = new Set(expandedJobs)
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId)
    } else {
      newExpanded.add(jobId)
    }
    setExpandedJobs(newExpanded)
  }

  const handlePlaceBid = async (jobId: bigint) => {
    if (reputation.reputationScore < 10) {
      showToast({
        title: "Insufficient Reputation",
        description: "You need at least 10 reputation points to place bids",
      })
      return
    }

    try {
      await placeBid(jobId, bidAmount || '0')
      showToast({
        title: "Bid Submitted",
        description: "Your bid has been registered on the blockchain",
      })
      setBidAmount('')
      setShowBidForm(null)
      // Wait a bit for transaction to be mined, then refetch
      setTimeout(() => {
        refetch()
      }, 2000)
    } catch (error: any) {
      showToast({
        title: "Error",
        description: error?.message || "Failed to submit bid",
      })
    }
  }

  const handleAcceptBid = async (jobId: bigint, workerAddress: `0x${string}`) => {
    try {
      await acceptBid(jobId, workerAddress)
      showToast({
        title: "Bid Accepted",
        description: "The worker has been assigned to the job",
      })
      // Wait a bit for transaction to be mined, then refetch
      setTimeout(() => {
        refetch()
      }, 2000)
    } catch (error: any) {
      showToast({
        title: "Error",
        description: error?.message || "Failed to accept bid",
      })
    }
  }

  const handleCompleteJob = async (jobId: bigint) => {
    try {
      await completeJob(jobId)
      showToast({
        title: "Job Completed",
        description: "Payment has been released and your reputation has increased",
      })
      // Wait a bit for transaction to be mined, then refetch
      setTimeout(() => {
        refetch()
      }, 2000)
    } catch (error: any) {
      showToast({
        title: "Error",
        description: error?.message || "Failed to complete job",
      })
    }
  }

  const handleCancelJob = async (jobId: bigint) => {
    if (!confirm('Are you sure you want to cancel this job? The payment will be refunded.')) {
      return
    }

    try {
      await cancelJob(jobId)
      showToast({
        title: "Job Cancelled",
        description: "Payment has been refunded",
      })
      // Wait a bit for transaction to be mined, then refetch
      setTimeout(() => {
        refetch()
      }, 2000)
    } catch (error: any) {
      showToast({
        title: "Error",
        description: error?.message || "Failed to cancel job",
      })
    }
  }

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neural-blue via-somnia-purple/20 to-mx-green/10">
        <Navbar />
        <main className="pt-20 pb-16 flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6 max-w-md p-8"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-white/70 mb-6">Connect your wallet to view your jobs</p>
            <div className="flex justify-center">
              <appkit-button />
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-blue via-somnia-purple/20 to-mx-green/10">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white to-somnia-purple bg-clip-text text-transparent">
                My Jobs
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-white/70 font-mono">
                  Manage all your onchain jobs • {allJobIds.length} jobs
                </p>
                {isRefreshing && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-somnia-cyan border-t-transparent rounded-full"
                  />
                )}
              </div>
            </div>
            <Link href="/gigstream/post">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-somnia-purple to-mx-green rounded-2xl text-white font-bold shadow-neural-glow"
              >
                <Plus className="w-5 h-5" />
                <span>Post Job</span>
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="backdrop-blur-xl bg-gradient-to-r from-somnia-purple/20 to-mx-green/20 rounded-2xl p-6 border border-somnia-purple/30"
            >
              <div className="flex items-center space-x-3">
                <Briefcase className="w-8 h-8 text-somnia-purple" />
                <div>
                  <p className="text-white/70 text-sm">Posted Jobs</p>
                  <p className="text-2xl font-bold text-white">{userJobIds?.length || 0}</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl bg-gradient-to-r from-mx-green/20 to-somnia-cyan/20 rounded-2xl p-6 border border-mx-green/30"
            >
              <div className="flex items-center space-x-3">
                <UserCheck className="w-8 h-8 text-mx-green" />
                <div>
                  <p className="text-white/70 text-sm">Assigned Jobs</p>
                  <p className="text-2xl font-bold text-white">{workerJobIds?.length || 0}</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="backdrop-blur-xl bg-gradient-to-r from-neural-blue/20 to-somnia-purple/20 rounded-2xl p-6 border border-neural-blue/30"
            >
              <div className="flex items-center space-x-3">
                <Zap className="w-8 h-8 text-neural-blue" />
                <div>
                  <p className="text-white/70 text-sm">Reputation</p>
                  <p className="text-2xl font-bold text-white">{reputation.reputationScore}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Jobs List */}
          {allJobIds.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="backdrop-blur-xl bg-white/5 rounded-3xl p-12 border border-white/10 text-center"
            >
              <Briefcase className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/70 text-lg mb-4">You don&apos;t have any jobs yet</p>
              <Link href="/gigstream/post">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-somnia-purple to-mx-green rounded-xl text-white font-bold shadow-neural-glow"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Post First Job
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {allJobIds.map((jobId, index) => (
                <JobCardWithActions
                  key={jobId.toString()}
                  jobId={jobId}
                  address={address!}
                  userJobIds={userJobIds || []}
                  workerJobIds={workerJobIds || []}
                  isExpanded={expandedJobs.has(jobId.toString())}
                  onToggleExpand={() => toggleExpand(jobId.toString())}
                  onPlaceBid={handlePlaceBid}
                  onAcceptBid={handleAcceptBid}
                  onCompleteJob={handleCompleteJob}
                  onCancelJob={handleCancelJob}
                  isPlacingBid={isPlacingBid}
                  isAcceptingBid={isAcceptingBid}
                  isCompletingJob={isCompletingJob}
                  isCancellingJob={isCancellingJob}
                  reputation={reputation.reputationScore}
                  bidAmount={bidAmount}
                  setBidAmount={setBidAmount}
                  showBidForm={showBidForm === jobId}
                  setShowBidForm={(show) => setShowBidForm(show ? jobId : null)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

// Component for each job with all actions
function JobCardWithActions({
  jobId,
  address,
  userJobIds,
  workerJobIds,
  isExpanded,
  onToggleExpand,
  onPlaceBid,
  onAcceptBid,
  onCompleteJob,
  onCancelJob,
  isPlacingBid,
  isAcceptingBid,
  isCompletingJob,
  isCancellingJob,
  reputation,
  bidAmount,
  setBidAmount,
  showBidForm,
  setShowBidForm,
}: {
  jobId: bigint
  address: `0x${string}`
  userJobIds: readonly bigint[]
  workerJobIds: readonly bigint[]
  isExpanded: boolean
  onToggleExpand: () => void
  onPlaceBid: (jobId: bigint) => void
  onAcceptBid: (jobId: bigint, worker: `0x${string}`) => void
  onCompleteJob: (jobId: bigint) => void
  onCancelJob: (jobId: bigint) => void
  isPlacingBid: boolean
  isAcceptingBid: boolean
  isCompletingJob: boolean
  isCancellingJob: boolean
  reputation: number
  bidAmount: string
  setBidAmount: (amount: string) => void
  showBidForm: boolean
  setShowBidForm: (show: boolean) => void
}) {
  const { job, isLoading } = useJob(jobId)
  const { bids, isLoading: bidsLoading } = useJobBids(jobId)

  if (isLoading || !job) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
        </div>
      </motion.div>
    )
  }

  const isEmployer = address.toLowerCase() === job.employer.toLowerCase()
  const isWorker = address.toLowerCase() === job.worker.toLowerCase()
  const isAssigned = job.worker !== '0x0000000000000000000000000000000000000000'
  const canBid = !isEmployer && !isAssigned && !job.completed && !job.cancelled
  const hasMinReputation = reputation >= 10
  const isMyJob = userJobIds.includes(jobId)
  const isMyAssignedJob = workerJobIds.includes(jobId)

  const statusColor = job.completed
    ? 'text-mx-green'
    : job.cancelled
    ? 'text-red-500'
    : isAssigned
    ? 'text-somnia-cyan'
    : 'text-yellow-500'

  const statusText = job.completed
    ? 'Completed'
    : job.cancelled
    ? 'Cancelled'
    : isAssigned
    ? 'Assigned'
    : 'Open'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-white">{job.title}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor} bg-current/20`}>
                {statusText}
              </span>
              {isMyJob && (
                <span className="px-3 py-1 rounded-full text-xs font-bold text-somnia-purple bg-somnia-purple/20">
                  My Job
                </span>
              )}
              {isMyAssignedJob && (
                <span className="px-3 py-1 rounded-full text-xs font-bold text-mx-green bg-mx-green/20">
                  Assigned to Me
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span className="font-mono">{formatEther(job.reward)} STT</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {formatDistanceToNow(new Date(Number(job.deadline) * 1000), {
                    addSuffix: true,
                    locale: enUS,
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/gigstream/job/${jobId.toString()}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
              >
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleExpand}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
            >
              {isExpanded ? (
                <X className="w-5 h-5" />
              ) : (
                <Zap className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Expanded Actions */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-white/10 bg-white/5"
        >
          <div className="p-6 space-y-4">
            {/* Actions for Employer */}
            {isEmployer && !job.completed && !job.cancelled && (
              <div className="space-y-3">
                <h4 className="text-white font-bold flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Actions as Employer
                </h4>
                
                {/* Cancel Job */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onCancelJob(jobId)}
                  disabled={isCancellingJob}
                  className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-white font-bold border border-red-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  {isCancellingJob ? 'Cancelling...' : 'Cancel Job'}
                </motion.button>

                {/* Accept Bids */}
                {bids && bids.length > 0 && !isAssigned && (
                  <div className="space-y-2">
                    <p className="text-white/70 text-sm font-bold">Received Bids ({bids.length}):</p>
                    {bids.map((bid: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex-1">
                          <p className="text-white text-sm font-mono">
                            {bid.worker.slice(0, 6)}...{bid.worker.slice(-4)}
                          </p>
                          {bid.amount > 0n && (
                            <p className="text-white/70 text-xs">
                              Bid: {formatEther(bid.amount)} STT
                            </p>
                          )}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onAcceptBid(jobId, bid.worker as `0x${string}`)}
                          disabled={isAcceptingBid || bid.accepted}
                          className="px-4 py-2 bg-gradient-to-r from-mx-green to-somnia-cyan rounded-lg text-white font-bold text-sm disabled:opacity-50 flex items-center gap-2"
                        >
                          <Handshake className="w-4 h-4" />
                          {bid.accepted ? 'Accepted' : isAcceptingBid ? 'Accepting...' : 'Accept'}
                        </motion.button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions for Worker */}
            {isWorker && !job.completed && !job.cancelled && (
              <div className="space-y-3">
                <h4 className="text-white font-bold flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Actions as Worker
                </h4>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onCompleteJob(jobId)}
                  disabled={isCompletingJob}
                  className="w-full px-4 py-3 bg-gradient-to-r from-mx-green to-emerald-400 rounded-xl text-white font-bold shadow-neural-glow disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {isCompletingJob ? 'Completing...' : 'Complete Job'}
                </motion.button>
              </div>
            )}

            {/* Actions for Bidding */}
            {canBid && (
              <div className="space-y-3">
                <h4 className="text-white font-bold flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Place Bid
                </h4>
                {!hasMinReputation && (
                  <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-500 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      You need at least 10 reputation points to place bids
                    </p>
                  </div>
                )}
                {!showBidForm ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowBidForm(true)}
                    disabled={!hasMinReputation}
                    className="w-full px-4 py-3 bg-gradient-to-r from-somnia-purple to-mx-green rounded-xl text-white font-bold shadow-neural-glow disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Place Bid
                  </motion.button>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="Bid amount (optional)"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                    />
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onPlaceBid(jobId)}
                        disabled={isPlacingBid}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-somnia-purple to-mx-green rounded-lg text-white font-bold disabled:opacity-50"
                      >
                        {isPlacingBid ? 'Submitting...' : 'Submit Bid'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowBidForm(false)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Job Info */}
            <div className="pt-4 border-t border-white/10">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/70">Employer</p>
                  <p className="text-white font-mono text-xs">
                    {job.employer.slice(0, 6)}...{job.employer.slice(-4)}
                  </p>
                </div>
                {isAssigned && (
                  <div>
                    <p className="text-white/70">Worker</p>
                    <p className="text-white font-mono text-xs">
                      {job.worker.slice(0, 6)}...{job.worker.slice(-4)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-white/70">Created</p>
                  <p className="text-white text-xs">
                    {formatDistanceToNow(new Date(Number(job.createdAt) * 1000), {
                      addSuffix: true,
                      locale: enUS,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-white/70">ID</p>
                  <p className="text-white font-mono text-xs">#{jobId.toString()}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

