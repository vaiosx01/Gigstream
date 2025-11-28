// src/app/gigstream/job/[id]/page.tsx - Job Detail Page with Full Onchain Integration
'use client'

import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { MapPin, DollarSign, Clock, User, CheckCircle, XCircle, Send, Handshake, Zap, ArrowLeft, Users } from 'lucide-react'
import { formatEther, parseEther } from 'viem'
import { useJob } from '@/hooks/useJob'
import { useJobBids } from '@/hooks/useJobBids'
import { useGigStream } from '@/hooks/useGigStream'
import { useAccount } from 'wagmi'
import { useToast } from '@/components/ui/use-toast'
import Navbar from '@/components/somnia/Navbar'
import Footer from '@/components/somnia/Footer'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { useState } from 'react'

export default function JobDetailPage() {
  const params = useParams()
  const jobId = BigInt(params.id as string)
  const { job, isLoading: jobLoading, refetch: refetchJob } = useJob(jobId)
  const { bids, isLoading: bidsLoading, refetch: refetchBids } = useJobBids(jobId)
  const { address } = useAccount()
  const { placeBid, acceptBid, completeJob, cancelJob, isPlacingBid, isAcceptingBid, isCompletingJob, isCancellingJob, reputation } = useGigStream()
  const { showToast } = useToast()
  const [bidAmount, setBidAmount] = useState('')
  const [showBidForm, setShowBidForm] = useState(false)

  const isEmployer = address?.toLowerCase() === job?.employer.toLowerCase()
  const isWorker = address?.toLowerCase() === job?.worker.toLowerCase()
  const isAssigned = job?.worker !== '0x0000000000000000000000000000000000000000'
  const canBid = !isEmployer && !isAssigned && !job?.completed && !job?.cancelled
  const hasMinReputation = reputation.reputationScore >= 10

  const handlePlaceBid = async () => {
    if (!hasMinReputation) {
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
        description: "Your bid has been recorded on the blockchain",
      })
      setBidAmount('')
      setShowBidForm(false)
      refetchBids()
    } catch (error: any) {
      showToast({
        title: "Error",
        description: error?.message || "Failed to submit bid",
      })
    }
  }

  const handleAcceptBid = async (workerAddress: `0x${string}`) => {
    try {
      await acceptBid(jobId, workerAddress)
      showToast({
        title: "Bid Accepted",
        description: "The worker has been assigned to the job",
      })
      refetchJob()
      refetchBids()
    } catch (error: any) {
      showToast({
        title: "Error",
        description: error?.message || "Failed to accept bid",
      })
    }
  }

  const handleCompleteJob = async () => {
    try {
      await completeJob(jobId)
      showToast({
        title: "Job Completed",
        description: "Payment has been released and your reputation has increased",
      })
      refetchJob()
    } catch (error: any) {
      showToast({
        title: "Error",
        description: error?.message || "Failed to complete job",
      })
    }
  }

  const handleCancelJob = async () => {
    try {
      await cancelJob(jobId)
      showToast({
        title: "Job Cancelled",
        description: "Refund has been processed",
      })
      refetchJob()
    } catch (error: any) {
      showToast({
        title: "Error",
        description: error?.message || "Failed to cancel job",
      })
    }
  }

  if (jobLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neural-blue via-somnia-purple/20 to-mx-green/10">
        <Navbar />
        <main className="pt-20 flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <div className="text-white">Loading job...</div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!job || job.id === 0n) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neural-blue via-somnia-purple/20 to-mx-green/10">
        <Navbar />
        <main className="pt-20 flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Job Not Found</h2>
            <Link href="/gigstream" className="text-somnia-cyan hover:underline">
              Back to Dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const deadlineDate = new Date(Number(job.deadline) * 1000)
  const createdAtDate = new Date(Number(job.createdAt) * 1000)
  const isDeadlinePassed = job.deadline <= BigInt(Math.floor(Date.now() / 1000))

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-blue via-somnia-purple/20 to-mx-green/10">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
          {/* Back Button */}
          <Link href="/gigstream">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </motion.button>
          </Link>

          {/* Job Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-white/5 rounded-3xl p-6 md:p-8 border border-white/10 shadow-neural-glow"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-black text-white mb-4">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-white/70 font-mono text-sm">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-mx-green font-bold text-lg">{formatEther(job.reward)} STT</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{formatDistanceToNow(deadlineDate, { addSuffix: true, locale: enUS })}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {job.completed && (
                  <span className="px-4 py-2 bg-mx-green/30 rounded-full text-mx-green font-bold flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Completed</span>
                  </span>
                )}
                {job.cancelled && (
                  <span className="px-4 py-2 bg-red-400/30 rounded-full text-red-400 font-bold flex items-center space-x-2">
                    <XCircle className="w-5 h-5" />
                    <span>Cancelled</span>
                  </span>
                )}
                {!job.completed && !job.cancelled && isAssigned && (
                  <span className="px-4 py-2 bg-somnia-cyan/30 rounded-full text-somnia-cyan font-bold flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Assigned</span>
                  </span>
                )}
                {!job.completed && !job.cancelled && !isAssigned && (
                  <span className="px-4 py-2 bg-mx-green/30 rounded-full text-mx-green font-bold flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>Available</span>
                  </span>
                )}
              </div>
            </div>

            {/* Job Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="text-white/60 text-xs font-mono uppercase mb-2">Employer</div>
                <div className="text-white font-mono">{job.employer.slice(0, 6)}...{job.employer.slice(-4)}</div>
              </div>
              {isAssigned && (
                <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="text-white/60 text-xs font-mono uppercase mb-2">Worker</div>
                  <div className="text-white font-mono">{job.worker.slice(0, 6)}...{job.worker.slice(-4)}</div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {isEmployer && !job.completed && !job.cancelled && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancelJob}
                  disabled={isCancellingJob}
                  className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-white font-bold border border-red-500/30 disabled:opacity-50"
                >
                  {isCancellingJob ? 'Cancelling...' : 'Cancel Job'}
                </motion.button>
              )}
              {isWorker && !job.completed && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCompleteJob}
                  disabled={isCompletingJob}
                  className="px-6 py-3 bg-gradient-to-r from-mx-green to-emerald-400 rounded-xl text-white font-bold shadow-neural-glow disabled:opacity-50"
                >
                  {isCompletingJob ? 'Completing...' : 'Complete Job'}
                </motion.button>
              )}
              {canBid && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowBidForm(!showBidForm)}
                  className="px-6 py-3 bg-gradient-to-r from-somnia-purple to-mx-green rounded-xl text-white font-bold shadow-neural-glow"
                >
                  <Send className="w-5 h-5 inline mr-2" />
                  {showBidForm ? 'Cancel' : 'Place Bid'}
                </motion.button>
              )}
            </div>

            {/* Bid Form */}
            {showBidForm && canBid && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10"
              >
                {!hasMinReputation && (
                  <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-yellow-400">
                    <p className="font-bold mb-2">Insufficient Reputation</p>
                    <p className="text-sm">You need at least 10 reputation points. Your current reputation: {reputation.reputationScore}</p>
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="text-white/80 mb-2 block font-mono text-sm">Bid Amount (STT)</label>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="0 (optional)"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 backdrop-blur-xl focus:outline-none focus:border-somnia-purple/50"
                    />
                    <p className="text-xs text-white/50 mt-2">Leave at 0 to accept the job price</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePlaceBid}
                    disabled={isPlacingBid || !hasMinReputation}
                    className="w-full px-6 py-3 bg-gradient-to-r from-somnia-purple to-mx-green rounded-xl text-white font-bold shadow-neural-glow disabled:opacity-50"
                  >
                    {isPlacingBid ? 'Submitting Bid...' : 'Submit Bid'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Bids Section */}
          {isEmployer && !job.completed && !job.cancelled && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="backdrop-blur-xl bg-white/5 rounded-3xl p-6 md:p-8 border border-white/10 shadow-neural-glow"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Users className="w-6 h-6 text-somnia-cyan" />
                <h2 className="text-2xl font-bold text-white">Bids ({bids.length})</h2>
              </div>

              {bidsLoading ? (
                <div className="text-white/70">Loading bids...</div>
              ) : bids.length === 0 ? (
                <div className="text-white/70 text-center py-8">No bids yet</div>
              ) : (
                <div className="space-y-4">
                  {bids.map((bid, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-white font-mono mb-2">
                            {bid.worker.slice(0, 6)}...{bid.worker.slice(-4)}
                          </div>
                          <div className="text-white/70 text-sm font-mono">
                            Bid: {formatEther(bid.amount)} STT
                          </div>
                          <div className="text-white/50 text-xs font-mono mt-1">
                            {formatDistanceToNow(new Date(Number(bid.timestamp) * 1000), { addSuffix: true, locale: enUS })}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {bid.accepted && (
                            <span className="px-4 py-2 bg-mx-green/30 rounded-full text-mx-green font-bold text-sm">
                              Accepted
                            </span>
                          )}
                          {!bid.accepted && !isAssigned && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleAcceptBid(bid.worker as `0x${string}`)}
                              disabled={isAcceptingBid}
                              className="px-6 py-2 bg-gradient-to-r from-somnia-purple to-mx-green rounded-xl text-white font-bold text-sm shadow-neural-glow disabled:opacity-50"
                            >
                              {isAcceptingBid ? 'Accepting...' : 'Accept'}
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

