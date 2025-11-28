// src/components/gigstream/LiveEventsPanel.tsx - Component to display live events from Data Streams
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEventStream } from '@/hooks/useEventStream'
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
import { useState } from 'react'

interface LiveEventsPanelProps {
  className?: string
  maxEvents?: number
}

export default function LiveEventsPanel({ 
  className = '', 
  maxEvents = 10 
}: LiveEventsPanelProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'jobs' | 'bids' | 'completions' | 'cancellations' | 'reputation'>('all')
  
  const jobsStream = useEventStream('jobs', true)
  const bidsStream = useEventStream('bids', true)
  const completionsStream = useEventStream('completions', true)
  const cancellationsStream = useEventStream('cancellations', true)
  const reputationStream = useEventStream('reputation', true)

  const allEvents = [
    ...jobsStream.events.map(e => ({ ...e, streamType: 'jobs' as const })),
    ...bidsStream.events.map(e => ({ ...e, streamType: 'bids' as const })),
    ...completionsStream.events.map(e => ({ ...e, streamType: 'completions' as const })),
    ...cancellationsStream.events.map(e => ({ ...e, streamType: 'cancellations' as const })),
    ...reputationStream.events.map(e => ({ ...e, streamType: 'reputation' as const })),
  ]
    .sort((a, b) => (b.receivedAt || 0) - (a.receivedAt || 0))
    .slice(0, maxEvents)

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
    <div className={`backdrop-blur-xl bg-white/5 rounded-3xl p-6 border border-white/10 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-mx-green animate-pulse' : 'bg-red-400'}`} />
          <h3 className="text-xl font-bold text-white">Live Events</h3>
        </div>
        <span className="text-xs text-white/60 font-mono">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-somnia-purple to-mx-green text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {tab.label} {tab.count > 0 && `(${tab.count})`}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event, index) => (
              <motion.div
                key={`${event.type}-${event.jobId || event.user || index}-${event.receivedAt}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`backdrop-blur-xl bg-gradient-to-r ${getEventColor(event.type)} rounded-xl p-3 border`}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">
                      {formatEventMessage(event)}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-3 h-3 text-white/40" />
                      <span className="text-xs text-white/50 font-mono">
                        {event.receivedAt 
                          ? formatDistanceToNow(new Date(event.receivedAt), { 
                              addSuffix: true, 
                              locale: enUS 
                            })
                          : 'Just now'}
                      </span>
                      {event.transactionHash && (
                        <a
                          href={`https://shannon-explorer.somnia.network/tx/${event.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-somnia-cyan hover:underline font-mono"
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
            <div className="text-center py-8">
              <p className="text-white/50 text-sm">
                {isConnected ? 'No events yet' : 'Connecting to streams...'}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-white/50 text-center">
            Reconnecting to event streams...
          </p>
        </div>
      )}
    </div>
  )
}

