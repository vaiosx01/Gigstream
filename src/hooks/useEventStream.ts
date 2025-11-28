// src/hooks/useEventStream.ts - Hook to consume Server-Sent Events streams
'use client'

import { useState, useEffect, useRef } from 'react'

export interface StreamEvent {
  type: string
  [key: string]: any
}

interface UseEventStreamResult {
  events: StreamEvent[]
  isConnected: boolean
  error: Error | null
  clearEvents: () => void
}

/**
 * Hook to consume Server-Sent Events (SSE) streams
 * @param streamType - Type of stream to consume (jobs, bids, completions, cancellations, reputation)
 * @param enabled - Whether to connect to the stream (defaults to true)
 */
export function useEventStream(
  streamType: 'jobs' | 'bids' | 'completions' | 'cancellations' | 'reputation',
  enabled: boolean = true
): UseEventStreamResult {
  const [events, setEvents] = useState<StreamEvent[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    // Create EventSource connection
    const eventSource = new EventSource(`/api/streams?type=${streamType}`)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setIsConnected(true)
      setError(null)
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        // Handle connection message
        if (data.type === 'connected') {
          setIsConnected(true)
          return
        }

        // Add timestamp if not present
        const eventData: StreamEvent = {
          ...data,
          receivedAt: Date.now(),
        }

        setEvents((prev) => [eventData, ...prev].slice(0, 100)) // Keep last 100 events
      } catch (err) {
        console.error('Error parsing SSE event:', err)
      }
    }

    eventSource.onerror = (err) => {
      console.error('EventSource error:', err)
      setError(new Error('Failed to connect to event stream'))
      setIsConnected(false)
    }

    // Cleanup on unmount
    return () => {
      eventSource.close()
      eventSourceRef.current = null
    }
  }, [streamType, enabled])

  const clearEvents = () => {
    setEvents([])
  }

  return {
    events,
    isConnected,
    error,
    clearEvents,
  }
}

