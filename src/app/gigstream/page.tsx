// src/app/gigstream/page.tsx - Dashboard with Live SDS Streams + AI Integration
'use client'

import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import Link from 'next/link'
import { MapPin, DollarSign, Clock, Zap, Plus, Brain } from 'lucide-react'
import { useEffect, useState } from 'react'
import Navbar from '@/components/somnia/Navbar'
import Footer from '@/components/somnia/Footer'
import AIInsightsPanel from '@/components/gigstream/AIInsightsPanel'
import AIJobMatcher from '@/components/gigstream/AIJobMatcher'
import AIBidOptimizer from '@/components/gigstream/AIBidOptimizer'
import GeminiBot from '@/components/chatbot/GeminiBot'

import { useGigStream } from '@/hooks/useGigStream'
import { useSDSJobs } from '@/hooks/useSDSJobs'
import JobCard from '@/components/gigstream/JobCard'
import SDSJobsIndicator from '@/components/gigstream/SDSJobsIndicator'

export default function GigStreamDashboard() {
  const { address, isConnected } = useAccount()
  const { jobCounter, refetch } = useGigStream()
  const [jobsCount, setJobsCount] = useState(0)
  
  // Fetch jobs from Somnia Data Streams (optional, for enrichment)
  const { jobs: sdsJobs } = useSDSJobs(address, isConnected)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-blue via-somnia-purple/20 to-mx-green/10">
      <Navbar />
      <main className="pt-20">
        {!isConnected ? (
          <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6 max-w-md"
            >
              <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
              <p className="text-white/70 mb-6">Connect your wallet to access the GigStream dashboard and start finding or posting jobs.</p>
              <div className="flex justify-center">
                <appkit-button />
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white to-somnia-purple bg-clip-text text-transparent">
                  GigStream Dashboard
                </h1>
                <div className="flex items-center space-x-3 mt-2">
                  <p className="text-white/70 font-mono">
                    Live SDS Streams • {jobsCount} active jobs
                  </p>
                  {sdsJobs.length > 0 && (
                    <SDSJobsIndicator publisher={address} showCount={true} />
                  )}
                </div>
              </div>
              <Link href="/gigstream/post">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-somnia-purple to-mx-green rounded-2xl text-white font-bold shadow-neural-glow"
                >
                  <Plus className="w-5 h-5" />
                  <span>Post Job</span>
                </motion.button>
              </Link>
            </motion.div>

            {/* Live Jobs Grid */}
            {jobsCount > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: Math.min(Number(jobsCount), 12) }, (_, i) => {
                  const jobId = BigInt(Number(jobsCount) - i)
                  return <JobCard key={jobId.toString()} jobId={jobId} />
                })}
              </div>
            ) : (
              <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-12 border border-white/10 text-center">
                <p className="text-white/70 text-lg mb-4">No jobs available yet</p>
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
              </div>
            )}

            {/* AI Features Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-somnia-cyan to-somnia-purple rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">AI-Powered Features</h2>
                  <p className="text-white/60 text-sm">Powered by Google Gemini</p>
                </div>
              </div>

              {/* AI Insights Panel */}
              <AIInsightsPanel />

              {/* AI Tools Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AIJobMatcher />
                <AIBidOptimizer />
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/gigstream/my-jobs">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="backdrop-blur-xl bg-gradient-to-r from-somnia-cyan/20 to-mx-green/20 rounded-3xl p-8 border border-somnia-cyan/30 shadow-neural-glow cursor-pointer"
                >
                  <h3 className="text-2xl font-bold text-white mb-2">My Jobs</h3>
                  <p className="text-white/70 font-mono">Manage all your onchain jobs</p>
                </motion.div>
              </Link>
              <Link href="/gigstream/profile">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="backdrop-blur-xl bg-gradient-to-r from-somnia-purple/20 to-mx-green/20 rounded-3xl p-8 border border-somnia-purple/30 shadow-neural-glow cursor-pointer"
                >
                  <h3 className="text-2xl font-bold text-white mb-2">My Profile</h3>
                  <p className="text-white/70 font-mono">View reputation and statistics</p>
                </motion.div>
              </Link>
              <div className="backdrop-blur-xl bg-gradient-to-r from-neural-blue/20 to-somnia-purple/20 rounded-3xl p-8 border border-neural-blue/30 shadow-neural-glow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold text-white">Live Streams</h3>
                  {sdsJobs.length > 0 && (
                    <SDSJobsIndicator publisher={address} showCount={false} />
                  )}
                </div>
                <p className="text-white/70 font-mono">SDS active • {jobsCount} events</p>
                {sdsJobs.length > 0 && (
                  <p className="text-xs text-somnia-cyan/80 font-mono mt-2">
                    {sdsJobs.length} job{sdsJobs.length !== 1 ? 's' : ''} in Data Streams
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
      <GeminiBot />
    </div>
  )
}

