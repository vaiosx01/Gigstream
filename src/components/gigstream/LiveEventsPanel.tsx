// src/components/gigstream/LiveEventsPanel.tsx - Component to display live events from Data Streams
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEventStream, StreamEvent } from '@/hooks/useEventStream'
import { useHistoricalEvents } from '@/hooks/useHistoricalEvents'
import { formatEther } from 'viem'
import { formatDistanceToNow } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { 
  Briefcase, 
  Handshake, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Zap,
  Clock
} from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'

interface LiveEventsPanelProps {
  className?: string
  maxEvents?: number
}

export default function LiveEventsPanel({ 
  className = '', 
  maxEvents = 10 
}: LiveEventsPanelProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'jobs' | 'bids' | 'completions' | 'cancellations' | 'reputation'>('all')
  
  // Real-time streams
  const jobsStream = useEventStream('jobs', true)
  const bidsStream = useEventStream('bids', true)
  const completionsStream = useEventStream('completions', true)
  const cancellationsStream = useEventStream('cancellations', true)
  const reputationStream = useEventStream('reputation', true)

  // Historical events
  const { events: historicalEvents, isLoading: isLoadingHistorical } = useHistoricalEvents()

  interface EventWithStreamType extends StreamEvent {
    streamType: 'jobs' | 'bids' | 'completions' | 'cancellations' | 'reputation'
  }

  // Combine real-time and historical events, removing duplicates by transaction hash
  const allEvents: EventWithStreamType[] = useMemo(() => {
    const realTimeEvents: EventWithStreamType[] = [
      ...jobsStream.events.map(e => ({ ...e, streamType: 'jobs' as const })),
      ...bidsStream.events.map(e => ({ ...e, streamType: 'bids' as const })),
      ...completionsStream.events.map(e => ({ ...e, streamType: 'completions' as const })),
      ...cancellationsStream.events.map(e => ({ ...e, streamType: 'cancellations' as const })),
      ...reputationStream.events.map(e => ({ ...e, streamType: 'reputation' as const })),
    ]

    // Map historical events to stream types
    const historicalWithStreamType: EventWithStreamType[] = historicalEvents.map(e => {
      let streamType: 'jobs' | 'bids' | 'completions' | 'cancellations' | 'reputation' = 'jobs'
      if (e.type === 'BidPlaced') streamType = 'bids'
      else if (e.type === 'JobCompleted') streamType = 'completions'
      else if (e.type === 'JobCancelled') streamType = 'cancellations'
      else if (e.type === 'ReputationUpdated') streamType = 'reputation'
      return { ...e, streamType }
    })

    // Combine and deduplicate by transaction hash
    const eventMap = new Map<string, EventWithStreamType>()
    
    // Add historical events first (older)
    historicalWithStreamType.forEach(e => {
      if (e.transactionHash) {
        eventMap.set(e.transactionHash, e)
      }
    })
    
    // Add real-time events (newer, will overwrite duplicates)
    realTimeEvents.forEach(e => {
      if (e.transactionHash) {
        eventMap.set(e.transactionHash, e)
      }
    })

    return Array.from(eventMap.values())
      .sort((a, b) => (b.receivedAt || 0) - (a.receivedAt || 0))
      .slice(0, maxEvents)
  }, [
    jobsStream.events,
    bidsStream.events,
    completionsStream.events,
    cancellationsStream.events,
    reputationStream.events,
    historicalEvents,
    maxEvents
  ])

  const filteredEvents = activeTab === 'all' 
    ? allEvents 
    : allEvents.filter(e => e.streamType === activeTab)

  const isConnected = jobsStream.isConnected || bidsStream.isConnected || 
                     completionsStream.isConnected || cancellationsStream.isConnected || 
                     reputationStream.isConnected

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'JobPosted':
        return <Briefcase className="w-4 h-4 text-somnia-purple" />
      case 'BidPlaced':
        return <Handshake className="w-4 h-4 text-mx-green" />
      case 'JobCompleted':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />
      case 'JobCancelled':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'ReputationUpdated':
        return <TrendingUp className="w-4 h-4 text-somnia-cyan" />
      default:
        return <Zap className="w-4 h-4 text-white/60" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'JobPosted':
        return 'from-somnia-purple/20 to-somnia-purple/10 border-somnia-purple/30'
      case 'BidPlaced':
        return 'from-mx-green/20 to-mx-green/10 border-mx-green/30'
      case 'JobCompleted':
        return 'from-emerald-400/20 to-emerald-400/10 border-emerald-400/30'
      case 'JobCancelled':
        return 'from-red-400/20 to-red-400/10 border-red-400/30'
      case 'ReputationUpdated':
        return 'from-somnia-cyan/20 to-somnia-cyan/10 border-somnia-cyan/30'
      default:
        return 'from-white/10 to-white/5 border-white/20'
    }
  }

  const formatEventMessage = (event: any) => {
    switch (event.type) {
      case 'JobPosted':
        return `New job: "${event.title}" - ${formatEther(BigInt(event.reward || '0'))} STT`
      case 'BidPlaced':
        return `Bid placed on job #${event.jobId} - ${formatEther(BigInt(event.bid || '0'))} STT`
      case 'JobCompleted':
        return `Job #${event.jobId} completed - ${formatEther(BigInt(event.reward || '0'))} STT paid`
      case 'JobCancelled':
        return `Job #${event.jobId} cancelled - ${formatEther(BigInt(event.refundAmount || '0'))} STT refunded`
      case 'ReputationUpdated':
        return `Reputation updated: ${event.reputation} pts`
      default:
        return JSON.stringify(event)
    }
  }

  const tabs = [
    { id: 'all', label: 'All', count: allEvents.length },
    { id: 'jobs', label: 'Jobs', count: jobsStream.events.length },
    { id: 'bids', label: 'Bids', count: bidsStream.events.length },
    { id: 'completions', label: 'Done', count: completionsStream.events.length },
    { id: 'cancellations', label: 'Cancelled', count: cancellationsStream.events.length },
    { id: 'reputation', label: 'Reputation', count: reputationStream.events.length },
  ] as const

  return (
    <div className={`backdrop-blur-xl bg-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/10 ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${isConnected ? 'bg-mx-green animate-pulse' : 'bg-red-400'}`} />
          <h3 className="text-lg sm:text-xl font-bold text-white">Live Events</h3>
        </div>
        <span className="text-xs text-white/60 font-mono">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-somnia-purple to-mx-green text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {tab.label} {tab.count > 0 && `(${tab.count})`}
          </button>
        ))}
      </div>

      {/* Connection Status Debug - Always visible for transparency */}
      <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-white/5 rounded-lg text-[10px] sm:text-xs text-white/50 font-mono space-y-1 overflow-x-auto">
        <div className="flex items-center justify-between">
          <span>Historical Events:</span>
          <span className={isLoadingHistorical ? 'text-yellow-400' : historicalEvents.length > 0 ? 'text-mx-green' : 'text-red-400'}>
            {isLoadingHistorical ? '⏳ Loading...' : historicalEvents.length > 0 ? `✅ ${historicalEvents.length} events` : '❌ No events found'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Jobs Stream:</span>
          <span className={jobsStream.isConnected ? 'text-mx-green' : 'text-red-400'}>
            {jobsStream.isConnected ? '✅ Connected' : '❌ Disconnected'} ({jobsStream.events.length} events)
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Bids Stream:</span>
          <span className={bidsStream.isConnected ? 'text-mx-green' : 'text-red-400'}>
            {bidsStream.isConnected ? '✅ Connected' : '❌ Disconnected'} ({bidsStream.events.length} events)
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Completions Stream:</span>
          <span className={completionsStream.isConnected ? 'text-mx-green' : 'text-red-400'}>
            {completionsStream.isConnected ? '✅ Connected' : '❌ Disconnected'} ({completionsStream.events.length} events)
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Cancellations Stream:</span>
          <span className={cancellationsStream.isConnected ? 'text-mx-green' : 'text-red-400'}>
            {cancellationsStream.isConnected ? '✅ Connected' : '❌ Disconnected'} ({cancellationsStream.events.length} events)
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Reputation Stream:</span>
          <span className={reputationStream.isConnected ? 'text-mx-green' : 'text-red-400'}>
            {reputationStream.isConnected ? '✅ Connected' : '❌ Disconnected'} ({reputationStream.events.length} events)
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span>Total Combined:</span>
          <span className="text-somnia-cyan font-bold">
            {allEvents.length} events
          </span>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-1.5 sm:space-y-2 max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto scrollbar-thin">
        <AnimatePresence mode="popLayout">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event, index) => (
              <motion.div
                key={`${event.type}-${event.jobId || event.user || index}-${event.receivedAt}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`backdrop-blur-xl bg-gradient-to-r ${getEventColor(event.type)} rounded-lg sm:rounded-xl p-2 sm:p-3 border`}
              >
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-white font-medium break-words">
                      {formatEventMessage(event)}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white/40" />
                        <span className="text-[10px] sm:text-xs text-white/50 font-mono">
                          {event.receivedAt 
                            ? formatDistanceToNow(new Date(event.receivedAt), { 
                                addSuffix: true, 
                                locale: enUS 
                              })
                            : 'Just now'}
                        </span>
                      </div>
                      {event.transactionHash && (
                        <a
                          href={`https://shannon-explorer.somnia.network/tx/${event.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] sm:text-xs text-somnia-cyan hover:underline font-mono"
                        >
                          View TX
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-6 sm:py-8">
              <div className="space-y-2">
                <p className="text-white/50 text-xs sm:text-sm px-2">
                  {isConnected 
                    ? 'No events yet - Events will appear here as they happen on-chain' 
                    : 'Connecting to streams...'}
                </p>
                {isConnected && (
                  <p className="text-white/30 text-[10px] sm:text-xs px-2">
                    Try posting a job or placing a bid to see live events!
                  </p>
                )}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10">
          <p className="text-[10px] sm:text-xs text-white/50 text-center">
            Reconnecting to event streams...
          </p>
        </div>
      )}
    </div>
  )
}

