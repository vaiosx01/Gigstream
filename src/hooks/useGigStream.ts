// src/hooks/useGigStream.ts - GigStream Hook with Contract Integration
'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi'
import { gigEscrowAbi } from '@/lib/viem'
import { GIGESCROW_ADDRESS } from '@/lib/contracts'
import { formatEther, parseEther } from 'viem'

export function useGigStream() {
  const { address, isConnected } = useAccount()
  
  // Read reputation from contract
  const { data: reputationScore, refetch: refetchReputation } = useReadContract({
    address: GIGESCROW_ADDRESS,
    abi: gigEscrowAbi,
    functionName: 'reputation',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && !!GIGESCROW_ADDRESS,
    },
  })

  // Read user jobs
  const { data: userJobIds, refetch: refetchUserJobs } = useReadContract({
    address: GIGESCROW_ADDRESS,
    abi: gigEscrowAbi,
    functionName: 'getUserJobs',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && !!GIGESCROW_ADDRESS,
    },
  })

  // Read worker jobs
  const { data: workerJobIds, refetch: refetchWorkerJobs } = useReadContract({
    address: GIGESCROW_ADDRESS,
    abi: gigEscrowAbi,
    functionName: 'getWorkerJobs',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && !!GIGESCROW_ADDRESS,
    },
  })

  // Watch for reputation updates
  useWatchContractEvent({
    address: GIGESCROW_ADDRESS,
    abi: gigEscrowAbi,
    eventName: 'ReputationUpdated',
    args: {
      user: address,
    },
    onLogs: () => {
      refetchReputation()
    },
  })

  // Watch for job updates
  useWatchContractEvent({
    address: GIGESCROW_ADDRESS,
    abi: gigEscrowAbi,
    eventName: 'JobCompleted',
    args: {
      worker: address,
    },
    onLogs: () => {
      refetchReputation()
      refetchWorkerJobs()
    },
  })

  // Watch for new jobs
  useWatchContractEvent({
    address: GIGESCROW_ADDRESS,
    abi: gigEscrowAbi,
    eventName: 'JobPosted',
    onLogs: (logs) => {
      // Check if the job was posted by the current user
      const userPosted = logs.some((log: any) => 
        log.args?.employer?.toLowerCase() === address?.toLowerCase()
      )
      if (userPosted) {
        refetchUserJobs()
      }
    },
  })

  // Watch for job acceptance
  useWatchContractEvent({
    address: GIGESCROW_ADDRESS,
    abi: gigEscrowAbi,
    eventName: 'JobAccepted',
    onLogs: (logs) => {
      // Check if the job was accepted for the current user
      const userInvolved = logs.some((log: any) => 
        log.args?.worker?.toLowerCase() === address?.toLowerCase() ||
        log.args?.employer?.toLowerCase() === address?.toLowerCase()
      )
      if (userInvolved) {
        refetchUserJobs()
        refetchWorkerJobs()
      }
    },
  })

  // Watch for job cancellation
  useWatchContractEvent({
    address: GIGESCROW_ADDRESS,
    abi: gigEscrowAbi,
    eventName: 'JobCancelled',
    onLogs: (logs) => {
      // Check if the job was cancelled by the current user
      const userInvolved = logs.some((log: any) => 
        log.args?.employer?.toLowerCase() === address?.toLowerCase()
      )
      if (userInvolved) {
        refetchUserJobs()
      }
    },
  })

  // Watch for bids
  useWatchContractEvent({
    address: GIGESCROW_ADDRESS,
    abi: gigEscrowAbi,
    eventName: 'BidPlaced',
    onLogs: () => {
      // Refetch job data when bids are placed (for employers to see new bids)
      refetchUserJobs()
    },
  })

  // Write contract functions
  const { writeContract: writePlaceBid, data: placeBidHash, isPending: isPlacingBid } = useWriteContract()
  const { writeContract: writeAcceptBid, data: acceptBidHash, isPending: isAcceptingBid } = useWriteContract()
  const { writeContract: writeCompleteJob, data: completeJobHash, isPending: isCompletingJob } = useWriteContract()
  const { writeContract: writeCancelJob, data: cancelJobHash, isPending: isCancellingJob } = useWriteContract()

  // Wait for transactions
  const { isLoading: isPlaceBidConfirming } = useWaitForTransactionReceipt({ hash: placeBidHash })
  const { isLoading: isAcceptBidConfirming } = useWaitForTransactionReceipt({ hash: acceptBidHash })
  const { isLoading: isCompleteJobConfirming } = useWaitForTransactionReceipt({ hash: completeJobHash })
  const { isLoading: isCancelJobConfirming } = useWaitForTransactionReceipt({ hash: cancelJobHash })

  // Get job counter
  const { data: jobCounter, refetch: refetchJobCounter } = useReadContract({
    address: GIGESCROW_ADDRESS,
    abi: gigEscrowAbi,
    functionName: 'jobCounter',
    query: {
      enabled: !!GIGESCROW_ADDRESS,
    },
  })

  const [reputation, setReputation] = useState({
    rating: 0,
    jobsCompleted: 0,
    totalEarnings: '0',
    reputationScore: 0,
  })

  useEffect(() => {
    if (address && isConnected) {
      const repScore = reputationScore ? Number(reputationScore) : 0
      const completedJobs = workerJobIds ? workerJobIds.length : 0
      
      // Calculate rating from reputation (simple formula: reputation / 10 = rating, max 5.0)
      const calculatedRating = Math.min(5.0, repScore / 10)
      
      setReputation({
        rating: calculatedRating || 0,
        jobsCompleted: completedJobs,
        totalEarnings: '0', // TODO: Calculate from completed jobs
        reputationScore: repScore,
      })
    } else {
      setReputation({
        rating: 0,
        jobsCompleted: 0,
        totalEarnings: '0',
        reputationScore: 0,
      })
    }
  }, [address, isConnected, reputationScore, workerJobIds])


  // Handler functions
  const handlePlaceBid = async (jobId: bigint, bidAmount: string = '0'): Promise<void> => {
    if (!address || !isConnected) throw new Error('Wallet not connected')
    
    try {
      await writePlaceBid({
        address: GIGESCROW_ADDRESS,
        abi: gigEscrowAbi,
        functionName: 'placeBid',
        args: [jobId, parseEther(bidAmount)],
      })
    } catch (error) {
      console.error('Error placing bid:', error)
      throw error
    }
  }

  const handleAcceptBid = async (jobId: bigint, workerAddress: `0x${string}`): Promise<void> => {
    if (!address || !isConnected) throw new Error('Wallet not connected')
    
    try {
      await writeAcceptBid({
        address: GIGESCROW_ADDRESS,
        abi: gigEscrowAbi,
        functionName: 'acceptBid',
        args: [jobId, workerAddress],
      })
    } catch (error) {
      console.error('Error accepting bid:', error)
      throw error
    }
  }

  const handleCompleteJob = async (jobId: bigint): Promise<void> => {
    if (!address || !isConnected) throw new Error('Wallet not connected')
    
    try {
      await writeCompleteJob({
        address: GIGESCROW_ADDRESS,
        abi: gigEscrowAbi,
        functionName: 'completeJob',
        args: [jobId],
      })
    } catch (error) {
      console.error('Error completing job:', error)
      throw error
    }
  }

  const handleCancelJob = async (jobId: bigint): Promise<void> => {
    if (!address || !isConnected) throw new Error('Wallet not connected')
    
    try {
      await writeCancelJob({
        address: GIGESCROW_ADDRESS,
        abi: gigEscrowAbi,
        functionName: 'cancelJob',
        args: [jobId],
      })
    } catch (error) {
      console.error('Error cancelling job:', error)
      throw error
    }
  }

  return {
    reputation,
    userJobIds: userJobIds || [],
    workerJobIds: workerJobIds || [],
    jobCounter: jobCounter || 0n,
    // Write functions
    placeBid: handlePlaceBid,
    acceptBid: handleAcceptBid,
    completeJob: handleCompleteJob,
    cancelJob: handleCancelJob,
    // Loading states
    isPlacingBid: isPlacingBid || isPlaceBidConfirming,
    isAcceptingBid: isAcceptingBid || isAcceptBidConfirming,
    isCompletingJob: isCompletingJob || isCompleteJobConfirming,
    isCancellingJob: isCancellingJob || isCancelJobConfirming,
    // Refetch function
    refetch: () => {
      refetchReputation()
      refetchUserJobs()
      refetchWorkerJobs()
      refetchJobCounter()
    },
  }
}

