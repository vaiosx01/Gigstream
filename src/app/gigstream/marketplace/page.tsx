// src/app/gigstream/marketplace/page.tsx - Jobs Marketplace - All Available Jobs
'use client'

import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import Link from 'next/link'
import { Store, Plus, Search, Filter, Zap } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import Navbar from '@/components/somnia/Navbar'
import Footer from '@/components/somnia/Footer'
import { useGigStream } from '@/hooks/useGigStream'
import JobCard from '@/components/gigstream/JobCard'

export default function MarketplacePage() {
  const { address, isConnected } = useAccount()
  const { jobCounter, refetch } = useGigStream()
  const [jobsCount, setJobsCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterAvailable, setFilterAvailable] = useState(true)

  // Get search query from URL params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const searchParam = params.get('search')
      if (searchParam) {
        setSearchQuery(decodeURIComponent(searchParam))
      }
    }
  }, [])

  // Fetch all jobs from contract
  useEffect(() => {
    if (jobCounter && jobCounter > 0n) {
      setJobsCount(Number(jobCounter))
    }
  }, [jobCounter])

  useEffect(() => {
    // Refetch jobs periodically
    const interval = setInterval(() => {
      refetch()
    }, 10000) // Every 10 seconds

    return () => clearInterval(interval)
  }, [refetch])

  // Generate all job IDs (newest first)
  const allJobIds = Array.from({ length: jobsCount }, (_, i) => 
    BigInt(Number(jobsCount) - i)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-blue via-somnia-purple/20 to-mx-green/10">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 md:space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-somnia-cyan to-somnia-purple rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Store className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-white to-somnia-purple bg-clip-text text-transparent">
                    Jobs Marketplace
                  </h1>
                  <p className="text-white/70 font-mono text-xs sm:text-sm mt-1">
                    Browse all available jobs from any user
                  </p>
                </div>
              </div>
            </div>
            {isConnected && (
              <Link href="/gigstream/post" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-somnia-purple to-mx-green rounded-xl sm:rounded-2xl text-white font-bold text-sm sm:text-base shadow-neural-glow"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Post Job</span>
                </motion.button>
              </Link>
            )}
          </motion.div>

          {/* Search and Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="backdrop-blur-xl bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10"
          >
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/50" />
                <input
                  type="text"
                  placeholder="Search jobs by title, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white placeholder-white/50 backdrop-blur-xl focus:outline-none focus:border-somnia-purple/50 text-sm sm:text-base"
                />
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => setFilterAvailable(!filterAvailable)}
                  className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base transition-all ${
                    filterAvailable
                      ? 'bg-mx-green/20 border border-mx-green/30 text-mx-green'
                      : 'bg-white/10 border border-white/20 text-white/70'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span>Available Only</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
          >
            <div className="backdrop-blur-xl bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-somnia-cyan/20 to-somnia-purple/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Store className="w-4 h-4 sm:w-5 sm:h-5 text-somnia-cyan" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-bold text-white">{jobsCount}</div>
                  <div className="text-white/60 text-xs sm:text-sm font-mono">Total Jobs</div>
                </div>
              </div>
            </div>
            <div className="backdrop-blur-xl bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-mx-green/20 to-emerald-400/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-mx-green" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-bold text-white">{allJobIds.length}</div>
                  <div className="text-white/60 text-xs sm:text-sm font-mono">Available Now</div>
                </div>
              </div>
            </div>
            <div className="backdrop-blur-xl bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-somnia-purple/20 to-mx-green/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-somnia-purple" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-bold text-white">Live</div>
                  <div className="text-white/60 text-xs sm:text-sm font-mono">Real-time Updates</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Jobs Grid */}
          {jobsCount > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  All Jobs ({allJobIds.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {allJobIds.map((jobId) => (
                  <JobCard key={jobId.toString()} jobId={jobId} />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl bg-white/5 rounded-3xl p-12 border border-white/10 text-center"
            >
              <Store className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/70 text-lg mb-4">No jobs available in the marketplace yet</p>
              {isConnected ? (
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
              ) : (
                <p className="text-white/50 text-sm">Connect your wallet to post a job</p>
              )}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

