// src/app/gigstream/job/[id]/page.tsx - Job Detail Page with Full Onchain Integration
'use client'

import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { MapPin, DollarSign, Clock, User, CheckCircle, XCircle, Send, Handshake, Zap, ArrowLeft, Users, UserPlus, Briefcase, History } from 'lucide-react'
import { formatEther, parseEther } from 'viem'
import { useJob } from '@/hooks/useJob'
import { useJobBids } from '@/hooks/useJobBids'
import { useGigStream } from '@/hooks/useGigStream'
import { useAccount, useReadContract } from 'wagmi'
import { gigEscrowAbi } from '@/lib/viem'
import { GIGESCROW_ADDRESS } from '@/lib/contracts'
import { useToast } from '@/components/ui/use-toast'
import Navbar from '@/components/somnia/Navbar'
import Footer from '@/components/somnia/Footer'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { useState, useEffect } from 'react'
import WorkerSearch from '@/components/gigstream/WorkerSearch'
import ContractFunctionChecker from '@/components/gigstream/ContractFunctionChecker'
import ContractAddressVerifier from '@/components/gigstream/ContractAddressVerifier'
import LiveEventsPanel from '@/components/gigstream/LiveEventsPanel'

export default function JobDetailPage() {
  const params = useParams()
  const jobId = BigInt(params.id as string)
  const { job, isLoading: jobLoading, refetch: refetchJob } = useJob(jobId)
  const { bids, isLoading: bidsLoading, refetch: refetchBids } = useJobBids(jobId)
  const { address } = useAccount()
  const { placeBid, acceptBid, completeJob, cancelJob, assignWorkerDirectly, isPlacingBid, isAcceptingBid, isCompletingJob, isCancellingJob, isAssigningWorker, assignWorkerHash, reputation, refetch: refetchGigStream } = useGigStream()
  const { showToast } = useToast()
  const [bidAmount, setBidAmount] = useState('')
  const [showBidForm, setShowBidForm] = useState(false)
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [workerAddress, setWorkerAddress] = useState<`0x${string}` | null>(null)

  const isEmployer = address?.toLowerCase() === job?.employer.toLowerCase()
  const isWorker = address?.toLowerCase() === job?.worker.toLowerCase()
  const isAssigned = job?.worker !== '0x0000000000000000000000000000000000000000'
  const canBid = !isEmployer && !isAssigned && !job?.completed && !job?.cancelled

  // Listen for worker assignment notifications
  useEffect(() => {
    const handleWorkerAssigned = (event: CustomEvent) => {
      const assignedWorker = event.detail?.logs?.[0]?.args?.worker
      if (assignedWorker?.toLowerCase() === address?.toLowerCase()) {
        showToast({
          title: "🎉 You've been assigned!",
          description: "An employer has assigned you directly to a job. Check your assigned jobs!",
          duration: 8000
        })
      }
    }

    window.addEventListener('worker-assigned', handleWorkerAssigned as EventListener)
    return () => {
      window.removeEventListener('worker-assigned', handleWorkerAssigned as EventListener)
    }
  }, [address, showToast])

  const handlePlaceBid = async () => {
    try {
      console.log('Attempting to place bid:', {
        jobId: jobId.toString(),
        bidAmount: bidAmount || '0',
        jobState: {
          completed: job?.completed,
          cancelled: job?.cancelled,
          assigned: isAssigned,
          employer: job?.employer
        }
      })
      
      await placeBid(jobId, bidAmount || '0')
      showToast({
        title: "Bid Submitted",
        description: "Your bid has been recorded on the blockchain",
      })
      setBidAmount('')
      setShowBidForm(false)
      refetchBids()
    } catch (error: any) {
      console.error('Error in handlePlaceBid:', error)
      
      // Provide user-friendly error messages
      let errorMessage = error?.message || "Failed to submit bid"
      
      if (errorMessage.includes('JobNotFound')) {
        errorMessage = "Job not found. The job may have been deleted."
      } else if (errorMessage.includes('JobAlreadyAssigned')) {
        errorMessage = "This job already has an assigned worker."
      } else if (errorMessage.includes('JobAlreadyCancelled')) {
        errorMessage = "Cannot place bid on a cancelled job."
      } else if (errorMessage.includes('User rejected')) {
        errorMessage = "Transaction was cancelled."
      } else if (errorMessage.includes('Insufficient balance')) {
        errorMessage = "Insufficient balance. Please check your STT balance for gas fees."
      } else if (errorMessage.includes('Network error')) {
        errorMessage = "Network error. Please check your connection and try again."
      }
      
      showToast({
        title: "Error Placing Bid",
        description: errorMessage,
        duration: 6000
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

  const handleAssignWorkerDirectly = async () => {
    if (!workerAddress || !workerAddress.startsWith('0x') || workerAddress.length !== 42) {
      showToast({
        title: "Invalid Address",
        description: "Please select a valid worker address",
      })
      return
    }

    // Validate job state before assigning
    if (job?.completed) {
      showToast({
        title: "Error",
        description: "Cannot assign worker to a completed job",
      })
      return
    }

    if (job?.cancelled) {
      showToast({
        title: "Error",
        description: "Cannot assign worker to a cancelled job",
      })
      return
    }

    if (isAssigned) {
      showToast({
        title: "Error",
        description: "This job already has an assigned worker",
      })
      return
    }

    try {
      console.log('Attempting to assign worker:', {
        jobId: jobId.toString(),
        workerAddress,
        isEmployer,
        jobState: {
          completed: job?.completed,
          cancelled: job?.cancelled,
          assigned: isAssigned
        }
      })
      
      await assignWorkerDirectly(jobId, workerAddress)
      
      // Wait for transaction confirmation before showing success
      // The hook already handles waiting, but we'll show a pending message
      showToast({
        title: "Transaction Submitted",
        description: "Assigning worker... Please wait for confirmation.",
        duration: 3000
      })
      
      // Wait a bit for the transaction to be mined, then refetch
      setTimeout(() => {
        refetchJob()
        refetchBids()
        setWorkerAddress(null)
        setShowAssignForm(false)
        
        showToast({
          title: "✅ Worker Assigned",
          description: "The worker has been assigned directly to the job",
          duration: 5000
        })
      }, 3000)
    } catch (error: any) {
      console.error('Error assigning worker:', error)
      
      // Provide user-friendly error messages
      let errorMessage = "Failed to assign worker"
      let errorTitle = "Error Assigning Worker"
      
      const errorMsg = error?.message || error?.shortMessage || error?.toString() || ''
      const errorData = error?.data || error?.cause?.data
      
      if (errorMsg.includes('User rejected') || errorMsg.includes('user rejected') || errorMsg.includes('rejected the request')) {
        errorMessage = "Transaction was cancelled by user"
        errorTitle = "Transaction Cancelled"
      } else if (errorMsg.includes('NotAuthorized') || errorMsg.includes('not authorized') || errorMsg.includes('Unauthorized')) {
        errorMessage = "You are not authorized to assign workers to this job. Only the job employer can assign workers."
        errorTitle = "Authorization Error"
      } else if (errorMsg.includes('JobAlreadyAssigned') || errorMsg.includes('already assigned')) {
        errorMessage = "This job already has an assigned worker"
        errorTitle = "Job Already Assigned"
      } else if (errorMsg.includes('JobNotFound') || errorMsg.includes('not found')) {
        errorMessage = "Job not found. The job may have been deleted or the ID is invalid."
        errorTitle = "Job Not Found"
      } else if (errorMsg.includes('JobAlreadyCancelled') || errorMsg.includes('cancelled')) {
        errorMessage = "Cannot assign worker to a cancelled job"
        errorTitle = "Job Cancelled"
      } else if (errorMsg.includes('InvalidAddress') || errorMsg.includes('invalid address')) {
        errorMessage = "Invalid worker address. Please check the address format (0x...42 characters)."
        errorTitle = "Invalid Address"
      } else if (errorMsg.includes('insufficient funds') || errorMsg.includes('balance')) {
        errorMessage = "Insufficient balance. Please check your STT balance for gas fees."
        errorTitle = "Insufficient Balance"
      } else if (errorMsg.includes('Internal JSON-RPC error') || errorMsg.includes('network')) {
        errorMessage = "Network error. Please check your connection and try again."
        errorTitle = "Network Error"
      } else if (errorMsg.includes('execution reverted') || errorMsg.includes('revert')) {
        // Try to extract specific revert reason
        const revertMatch = errorMsg.match(/revert\s+(\w+)/i) || errorMsg.match(/reverted\s+with\s+reason\s+string\s+['"]?(\w+)/i)
        if (revertMatch && revertMatch[1]) {
          const revertReason = revertMatch[1]
          if (revertReason === 'NotAuthorized') {
            errorMessage = "You are not authorized. Only the job employer can assign workers."
            errorTitle = "Authorization Error"
          } else if (revertReason === 'JobAlreadyAssigned') {
            errorMessage = "This job already has an assigned worker."
            errorTitle = "Job Already Assigned"
          } else if (revertReason === 'JobNotFound') {
            errorMessage = "Job not found. Please verify the job ID."
            errorTitle = "Job Not Found"
          } else if (revertReason === 'JobAlreadyCancelled') {
            errorMessage = "Cannot assign worker to a cancelled job."
            errorTitle = "Job Cancelled"
          } else if (revertReason === 'InvalidAddress') {
            errorMessage = "Invalid worker address."
            errorTitle = "Invalid Address"
          } else {
            errorMessage = `Contract error: ${revertReason}. Please verify job status and permissions.`
            errorTitle = "Contract Error"
          }
        } else if (errorData) {
          errorMessage = `Contract execution reverted. Error data: ${JSON.stringify(errorData)}`
          errorTitle = "Transaction Failed"
        } else {
          errorMessage = "Transaction failed: Contract execution reverted. Please verify:\n• You are the job employer\n• The job is not completed or cancelled\n• The job doesn't already have an assigned worker"
          errorTitle = "Transaction Failed"
        }
      } else if (errorMsg.includes('function') && (errorMsg.includes('not found') || errorMsg.includes('does not exist') || errorMsg.includes('is not a function'))) {
        errorMessage = "⚠️ The contract function 'assignWorkerDirectly' is not available in the deployed contract.\n\nThis feature requires redeploying the contract with the latest version.\n\nPlease contact support or redeploy the contract."
        errorTitle = "Function Not Available"
      } else if (errorMsg.includes('gas') || errorMsg.includes('Gas') || errorMsg.includes('gas required exceeds allowance')) {
        errorMessage = "Gas estimation failed. The transaction may be too complex or the contract state is invalid. Please try again or check your gas settings."
        errorTitle = "Gas Estimation Error"
      } else if (errorMsg.includes('nonce') || errorMsg.includes('Nonce')) {
        errorMessage = "Nonce error. Please wait a moment and try again."
        errorTitle = "Transaction Error"
      } else if (errorMsg) {
        errorMessage = errorMsg.length > 200 ? errorMsg.substring(0, 200) + '...' : errorMsg
      }
      
      showToast({
        title: errorTitle,
        description: errorMessage,
        duration: 8000
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
      <main className="pt-20 pb-12 sm:pb-16">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
          <ContractAddressVerifier />
          {/* Back Button */}
          <Link href="/gigstream">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors mb-3 sm:mb-4 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Back to Dashboard</span>
            </motion.button>
          </Link>

          {/* Job Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/10 shadow-neural-glow"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 sm:mb-4 break-words">{job.title}</h1>
                <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-4 text-white/70 font-mono text-xs sm:text-sm">
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="break-words">{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="text-mx-green font-bold text-base sm:text-lg">{formatEther(job.reward)} STT</span>
                  </div>
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>{formatDistanceToNow(deadlineDate, { addSuffix: true, locale: enUS })}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-2 flex-shrink-0">
                {job.completed && (
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-mx-green/30 rounded-full text-mx-green font-bold flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Completed</span>
                  </span>
                )}
                {job.cancelled && (
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-400/30 rounded-full text-red-400 font-bold flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm">
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Cancelled</span>
                  </span>
                )}
                {!job.completed && !job.cancelled && isAssigned && (
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-somnia-cyan/30 rounded-full text-somnia-cyan font-bold flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Assigned</span>
                  </span>
                )}
                {!job.completed && !job.cancelled && !isAssigned && (
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-mx-green/30 rounded-full text-mx-green font-bold flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Available</span>
                  </span>
                )}
              </div>
            </div>

            {/* Job Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="backdrop-blur-xl bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                <div className="text-white/60 text-[10px] sm:text-xs font-mono uppercase mb-1 sm:mb-2">Employer</div>
                <div className="text-white font-mono text-sm sm:text-base break-all">{job.employer.slice(0, 6)}...{job.employer.slice(-4)}</div>
              </div>
              {isAssigned && (
                <div className="backdrop-blur-xl bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                  <div className="text-white/60 text-[10px] sm:text-xs font-mono uppercase mb-1 sm:mb-2">Worker</div>
                  <div className="text-white font-mono text-sm sm:text-base break-all">{job.worker.slice(0, 6)}...{job.worker.slice(-4)}</div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {isEmployer && !job.completed && !job.cancelled && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancelJob}
                  disabled={isCancellingJob}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg sm:rounded-xl text-white font-bold text-sm sm:text-base border border-red-500/30 disabled:opacity-50"
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
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-mx-green to-emerald-400 rounded-lg sm:rounded-xl text-white font-bold text-sm sm:text-base shadow-neural-glow disabled:opacity-50"
                >
                  {isCompletingJob ? 'Completing...' : 'Complete Job'}
                </motion.button>
              )}
              {canBid && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowBidForm(!showBidForm)}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-somnia-purple to-mx-green rounded-lg sm:rounded-xl text-white font-bold text-sm sm:text-base shadow-neural-glow flex items-center space-x-2"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{showBidForm ? 'Cancel' : 'Place Bid'}</span>
                </motion.button>
              )}
            </div>

            {/* Bid Form */}
            {showBidForm && canBid && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 sm:mt-6 backdrop-blur-xl bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10"
              >
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="text-white/80 mb-2 block font-mono text-xs sm:text-sm">Bid Amount (STT)</label>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="0 (optional)"
                      className="w-full bg-white/10 border border-white/20 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-white/50 backdrop-blur-xl focus:outline-none focus:border-somnia-purple/50 text-sm sm:text-base"
                    />
                    <p className="text-[10px] sm:text-xs text-white/50 mt-2">Leave at 0 to accept the job price</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePlaceBid}
                    disabled={isPlacingBid}
                    className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-somnia-purple to-mx-green rounded-lg sm:rounded-xl text-white font-bold text-sm sm:text-base shadow-neural-glow disabled:opacity-50"
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
              className="backdrop-blur-xl bg-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/10 shadow-neural-glow"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-somnia-cyan" />
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Bids ({bids.length})</h2>
                </div>
                {!isAssigned && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAssignForm(!showAssignForm)}
                    className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-somnia-purple to-mx-green rounded-lg sm:rounded-xl text-white font-bold text-xs sm:text-sm shadow-neural-glow flex items-center justify-center space-x-2"
                  >
                    <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{showAssignForm ? 'Cancel' : 'Assign Worker Directly'}</span>
                  </motion.button>
                )}
              </div>

              {/* Direct Assignment Form */}
              {showAssignForm && !isAssigned && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 sm:mb-6 backdrop-blur-xl bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10"
                >
                  <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-somnia-cyan/20 border border-somnia-cyan/30 rounded-lg sm:rounded-xl text-somnia-cyan">
                    <p className="font-bold mb-2 flex items-center space-x-2 text-sm sm:text-base">
                      <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Assign Worker Directly</span>
                    </p>
                    <p className="text-xs sm:text-sm mb-2">Assign a worker without requiring bids. Useful for new workers who don&apos;t have enough reputation yet.</p>
                    <p className="text-[10px] sm:text-xs text-somnia-cyan/80 mb-2">
                      💡 <strong>Tip:</strong> Ask the worker to share their wallet address (0x...), then paste it in the field below.
                    </p>
                    {!isEmployer && (
                      <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400 text-[10px] sm:text-xs">
                        ⚠️ Only the job employer can assign workers directly
                      </div>
                    )}
                  </div>
                  <ContractFunctionChecker functionName="assignWorkerDirectly" />
                  <div className="space-y-3 sm:space-y-4">
                    <WorkerSearch
                      onSelectWorker={(address) => setWorkerAddress(address)}
                      selectedWorker={workerAddress}
                      availableWorkers={bids.map(bid => bid.worker as `0x${string}`)}
                    />
                    {workerAddress && (
                      <WorkerHistory address={workerAddress} />
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAssignWorkerDirectly}
                      disabled={isAssigningWorker || !workerAddress || job?.completed || job?.cancelled || isAssigned}
                      className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-somnia-cyan to-mx-green rounded-lg sm:rounded-xl text-white font-bold text-sm sm:text-base shadow-neural-glow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAssigningWorker ? (
                        <span className="flex items-center justify-center space-x-2">
                          <span className="animate-spin">⏳</span>
                          <span>Assigning Worker...</span>
                        </span>
                      ) : (
                        'Assign Worker'
                      )}
                    </motion.button>
                    {assignWorkerHash && (
                      <div className="text-center space-y-1">
                        <div className="text-[10px] sm:text-xs text-white/60 font-mono break-all">
                          Transaction: {assignWorkerHash.slice(0, 10)}...{assignWorkerHash.slice(-8)}
                        </div>
                        <a
                          href={`https://shannon-explorer.somnia.network/tx/${assignWorkerHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] sm:text-xs text-somnia-cyan hover:text-somnia-cyan/80 underline"
                        >
                          View on Explorer
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {bidsLoading ? (
                <div className="text-white/70 text-sm sm:text-base">Loading bids...</div>
              ) : bids.length === 0 ? (
                <div className="text-white/70 text-center py-6 sm:py-8 text-sm sm:text-base">No bids yet</div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {bids.map((bid, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="backdrop-blur-xl bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-mono mb-1 sm:mb-2 text-sm sm:text-base break-all">
                            {bid.worker.slice(0, 6)}...{bid.worker.slice(-4)}
                          </div>
                          <div className="text-white/70 text-xs sm:text-sm font-mono">
                            Bid: {formatEther(bid.amount)} STT
                          </div>
                          <div className="text-white/50 text-[10px] sm:text-xs font-mono mt-1">
                            {formatDistanceToNow(new Date(Number(bid.timestamp) * 1000), { addSuffix: true, locale: enUS })}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
                          {bid.accepted && (
                            <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-mx-green/30 rounded-full text-mx-green font-bold text-xs sm:text-sm">
                              Accepted
                            </span>
                          )}
                          {!bid.accepted && !isAssigned && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleAcceptBid(bid.worker as `0x${string}`)}
                              disabled={isAcceptingBid}
                              className="w-full sm:w-auto px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-somnia-purple to-mx-green rounded-lg sm:rounded-xl text-white font-bold text-xs sm:text-sm shadow-neural-glow disabled:opacity-50"
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

          {/* Live Events Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 sm:mt-8"
          >
            <LiveEventsPanel maxEvents={5} />
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

// Worker History Component
function WorkerHistory({ address }: { address: `0x${string}` }) {
  const { data: workerJobs } = useReadContract({
    address: GIGESCROW_ADDRESS,
    abi: gigEscrowAbi,
    functionName: 'getWorkerJobs',
    args: [address],
  })

  const { data: reputation } = useReadContract({
    address: GIGESCROW_ADDRESS,
    abi: gigEscrowAbi,
    functionName: 'reputation',
    args: [address],
  })

  const completedJobs = workerJobs?.length || 0
  const repScore = reputation ? Number(reputation) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-xl bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10"
    >
      <div className="flex items-center space-x-2 mb-2 sm:mb-3">
        <History className="w-3 h-3 sm:w-4 sm:h-4 text-somnia-cyan" />
        <h3 className="text-xs sm:text-sm font-bold text-white">Worker History</h3>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
        <div>
          <div className="text-white/60 text-[10px] sm:text-xs mb-1">Reputation</div>
          <div className="text-white font-bold text-sm sm:text-base">{repScore} pts</div>
          {repScore < 10 && (
            <div className="text-[10px] sm:text-xs text-yellow-400 mt-1">New worker</div>
          )}
        </div>
        <div>
          <div className="text-white/60 text-[10px] sm:text-xs mb-1">Completed Jobs</div>
          <div className="text-white font-bold text-sm sm:text-base">{completedJobs}</div>
        </div>
      </div>
      {completedJobs > 0 && (
        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/10">
          <div className="text-[10px] sm:text-xs text-white/50">
            This worker has completed {completedJobs} job{completedJobs !== 1 ? 's' : ''} on the platform.
          </div>
        </div>
      )}
    </motion.div>
  )
}

