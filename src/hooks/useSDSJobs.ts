// src/hooks/useSDSJobs.ts - Hook to fetch jobs from Somnia Data Streams
'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

interface SDSJob {
  jobId?: string | bigint
  employer?: string
  title?: string
  location?: string
  reward?: string | bigint
  deadline?: string | bigint
  timestamp?: string | number
}

interface UseSDSJobsResult {
  jobs: SDSJob[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Hook to fetch jobs from Somnia Data Streams
 * @param publisher - Address to fetch jobs for (defaults to connected wallet)
 * @param enabled - Whether to fetch (defaults to true if wallet connected)
 */
export function useSDSJobs(
  publisher?: `0x${string}`,
  enabled: boolean = true
): UseSDSJobsResult {
  const { address, isConnected } = useAccount()
  const [jobs, setJobs] = useState<SDSJob[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const targetPublisher = publisher || (address as `0x${string}` | undefined)

  const fetchJobs = async () => {
    if (!targetPublisher || !enabled || !isConnected) {
      setJobs([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/sds/read-jobs?publisher=${targetPublisher}&limit=100`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch jobs from Data Streams')
      }

      const data = await response.json()
      setJobs(data.jobs || [])
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      // Don't set jobs to empty on error - keep previous data
      console.error('Error fetching SDS jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [targetPublisher, enabled, isConnected])

  return {
    jobs,
    isLoading,
    error,
    refetch: fetchJobs,
  }
}

