// src/hooks/useHistoricalEvents.ts - Hook to fetch recent historical events from contract
'use client'

import { useState, useEffect } from 'react'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { GIGESCROW_ADDRESS, SOMNIA_CONFIG } from '@/lib/contracts'
import { StreamEvent } from './useEventStream'

const publicClient = createPublicClient({
  chain: {
    id: SOMNIA_CONFIG.chainId,
    name: SOMNIA_CONFIG.name,
    nativeCurrency: SOMNIA_CONFIG.nativeCurrency,
    rpcUrls: {
      default: {
        http: [SOMNIA_CONFIG.rpcUrl],
      },
    },
  },
  transport: http(SOMNIA_CONFIG.rpcUrl),
})

interface UseHistoricalEventsResult {
  events: StreamEvent[]
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to fetch recent historical events from the contract
 * Fetches events from the last 1000 blocks (approximately last hour on Somnia)
 */
export function useHistoricalEvents(): UseHistoricalEventsResult {
  const [events, setEvents] = useState<StreamEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchHistoricalEvents() {
      if (!GIGESCROW_ADDRESS || GIGESCROW_ADDRESS === '0x0000000000000000000000000000000000000000') {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Get current block number
        const currentBlock = await publicClient.getBlockNumber()
        const fromBlock = currentBlock - 1000n // Last ~1000 blocks

        // Fetch all event types
        const [jobPostedLogs, bidPlacedLogs, jobCompletedLogs, jobCancelledLogs, reputationLogs] = await Promise.all([
          // JobPosted events
          publicClient.getLogs({
            address: GIGESCROW_ADDRESS,
            event: parseAbiItem('event JobPosted(uint256 indexed jobId, address indexed employer, string title, uint256 reward, uint256 deadline)'),
            fromBlock,
            toBlock: 'latest',
          }).catch(() => []),
          
          // BidPlaced events
          publicClient.getLogs({
            address: GIGESCROW_ADDRESS,
            event: parseAbiItem('event BidPlaced(uint256 indexed jobId, address indexed worker, uint256 bid, uint256 timestamp)'),
            fromBlock,
            toBlock: 'latest',
          }).catch(() => []),
          
          // JobCompleted events
          publicClient.getLogs({
            address: GIGESCROW_ADDRESS,
            event: parseAbiItem('event JobCompleted(uint256 indexed jobId, address indexed worker, uint256 reward)'),
            fromBlock,
            toBlock: 'latest',
          }).catch(() => []),
          
          // JobCancelled events
          publicClient.getLogs({
            address: GIGESCROW_ADDRESS,
            event: parseAbiItem('event JobCancelled(uint256 indexed jobId, address indexed employer, uint256 refundAmount)'),
            fromBlock,
            toBlock: 'latest',
          }).catch(() => []),
          
          // ReputationUpdated events
          publicClient.getLogs({
            address: GIGESCROW_ADDRESS,
            event: parseAbiItem('event ReputationUpdated(address indexed user, uint256 newReputation)'),
            fromBlock,
            toBlock: 'latest',
          }).catch(() => []),
        ])

        const allEvents: StreamEvent[] = []

        // Process JobPosted events
        jobPostedLogs.forEach((log) => {
          allEvents.push({
            type: 'JobPosted',
            jobId: log.args.jobId?.toString() || '',
            employer: log.args.employer || '',
            title: log.args.title || '',
            reward: log.args.reward?.toString() || '0',
            deadline: log.args.deadline?.toString() || '0',
            blockNumber: log.blockNumber?.toString(),
            transactionHash: log.transactionHash,
            receivedAt: Date.now() - (Number(currentBlock - log.blockNumber!) * 2000), // Approximate timestamp
          })
        })

        // Process BidPlaced events
        bidPlacedLogs.forEach((log) => {
          allEvents.push({
            type: 'BidPlaced',
            jobId: log.args.jobId?.toString() || '',
            worker: log.args.worker || '',
            bid: log.args.bid?.toString() || '0',
            timestamp: log.args.timestamp?.toString() || '0',
            blockNumber: log.blockNumber?.toString(),
            transactionHash: log.transactionHash,
            receivedAt: Date.now() - (Number(currentBlock - log.blockNumber!) * 2000),
          })
        })

        // Process JobCompleted events
        jobCompletedLogs.forEach((log) => {
          allEvents.push({
            type: 'JobCompleted',
            jobId: log.args.jobId?.toString() || '',
            worker: log.args.worker || '',
            reward: log.args.reward?.toString() || '0',
            blockNumber: log.blockNumber?.toString(),
            transactionHash: log.transactionHash,
            receivedAt: Date.now() - (Number(currentBlock - log.blockNumber!) * 2000),
          })
        })

        // Process JobCancelled events
        jobCancelledLogs.forEach((log) => {
          allEvents.push({
            type: 'JobCancelled',
            jobId: log.args.jobId?.toString() || '',
            employer: log.args.employer || '',
            refundAmount: log.args.refundAmount?.toString() || '0',
            blockNumber: log.blockNumber?.toString(),
            transactionHash: log.transactionHash,
            receivedAt: Date.now() - (Number(currentBlock - log.blockNumber!) * 2000),
          })
        })

        // Process ReputationUpdated events
        reputationLogs.forEach((log) => {
          allEvents.push({
            type: 'ReputationUpdated',
            user: log.args.user || '',
            reputation: log.args.newReputation?.toString() || '0',
            blockNumber: log.blockNumber?.toString(),
            transactionHash: log.transactionHash,
            receivedAt: Date.now() - (Number(currentBlock - log.blockNumber!) * 2000),
          })
        })

        // Sort by receivedAt (most recent first)
        allEvents.sort((a, b) => (b.receivedAt || 0) - (a.receivedAt || 0))

        setEvents(allEvents)
      } catch (err) {
        console.error('Error fetching historical events:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch historical events'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistoricalEvents()
  }, [])

  return {
    events,
    isLoading,
    error,
  }
}

