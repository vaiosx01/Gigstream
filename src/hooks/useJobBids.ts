// src/hooks/useJobBids.ts - Hook to fetch bids for a job with real-time updates
'use client'

import { useReadContract, useWatchContractEvent } from 'wagmi'
import { gigEscrowAbi } from '@/lib/viem'
import { GIGESCROW_ADDRESS } from '@/lib/contracts'
import { useEffect } from 'react'

export function useJobBids(jobId: bigint | undefined) {
  const { data: bids, isLoading, error, refetch } = useReadContract({
    address: GIGESCROW_ADDRESS,
    abi: gigEscrowAbi,
    functionName: 'getJobBids',
    args: jobId ? [jobId] : undefined,
    query: {
      enabled: !!jobId && !!GIGESCROW_ADDRESS,
    },
  })

  // Watch for new bids in real-time
  useWatchContractEvent({
    address: GIGESCROW_ADDRESS,
    abi: gigEscrowAbi,
    eventName: 'BidPlaced',
    args: {
      jobId: jobId,
    },
    onLogs: () => {
      // Refetch bids when a new bid is placed
      refetch()
    },
  })

  return {
    bids: bids || [],
    isLoading,
    error,
    refetch,
  }
}

