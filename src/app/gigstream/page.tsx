// src/app/gigstream/page.tsx - Dashboard with Live SDS Streams + AI Integration
'use client'

import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import Link from 'next/link'
import { MapPin, DollarSign, Clock, Zap, Plus, Brain, Briefcase, User, Search, CheckCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import Navbar from '@/components/somnia/Navbar'
import Footer from '@/components/somnia/Footer'
import AIInsightsPanel from '@/components/gigstream/AIInsightsPanel'
import AIJobMatcher from '@/components/gigstream/AIJobMatcher'
import AIBidOptimizer from '@/components/gigstream/AIBidOptimizer'
import GeminiBot from '@/components/chatbot/GeminiBot'
import ProfileToggle from '@/components/gigstream/ProfileToggle'
import ContractAddressVerifier from '@/components/gigstream/ContractAddressVerifier'

import { useGigStream } from '@/hooks/useGigStream'
import { useSDSJobs } from '@/hooks/useSDSJobs'
import JobCard from '@/components/gigstream/JobCard'
import SDSJobsIndicator from '@/components/gigstream/SDSJobsIndicator'
import LiveEventsPanel from '@/components/gigstream/LiveEventsPanel'

type ProfileType = 'worker' | 'employer'

export default function GigStreamDashboard() {
  const { address, isConnected } = useAccount()
  const { jobCounter, refetch, userJobIds, workerJobIds, reputation } = useGigStream()
  const [jobsCount, setJobsCount] = useState(0)
  const [profile, setProfile] = useState<ProfileType>('worker')
  const [searchQuery, setSearchQuery] = useState('')
  
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
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                <div className="flex items-center space-x-3">
                  <ProfileToggle onProfileChange={setProfile} />
                  {profile === 'employer' && (
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
                  )}
                </div>
              </div>

              {/* Profile-specific stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {profile === 'worker' ? (
                  <>
                    <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="w-5 h-5 text-somnia-cyan" />
                        <span className="text-white/70 text-sm font-mono">Reputation</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{reputation.reputationScore} pts</p>
                      <p className="text-xs text-white/50 mt-1">
                        Can place bids
                      </p>
                    </div>
                    <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10">
                      <div className="flex items-center space-x-2 mb-2">
                        <Briefcase className="w-5 h-5 text-mx-green" />
                        <span className="text-white/70 text-sm font-mono">My Jobs</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{workerJobIds?.length || 0}</p>
                      <p className="text-xs text-white/50 mt-1">Assigned jobs</p>
                    </div>
                    <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        <span className="text-white/70 text-sm font-mono">Completed</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{reputation.jobsCompleted}</p>
                      <p className="text-xs text-white/50 mt-1">Jobs finished</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10">
                      <div className="flex items-center space-x-2 mb-2">
                        <Briefcase className="w-5 h-5 text-somnia-purple" />
                        <span className="text-white/70 text-sm font-mono">Posted Jobs</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{userJobIds?.length || 0}</p>
                      <p className="text-xs text-white/50 mt-1">Active listings</p>
                    </div>
                    <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10">
                      <div className="flex items-center space-x-2 mb-2">
                        <Search className="w-5 h-5 text-somnia-cyan" />
                        <span className="text-white/70 text-sm font-mono">Available</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{jobsCount}</p>
                      <p className="text-xs text-white/50 mt-1">Total jobs</p>
                    </div>
                    <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10">
                      <div className="flex items-center space-x-2 mb-2">
                        <Zap className="w-5 h-5 text-mx-green" />
                        <span className="text-white/70 text-sm font-mono">Quick Post</span>
                      </div>
                      <Link href="/gigstream/post">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-somnia-purple to-mx-green rounded-xl text-white font-bold text-sm"
                        >
                          Post Now
                        </motion.button>
                      </Link>
                    </div>
                  </>
                )}
              </motion.div>

              {/* Search bar for workers */}
              {profile === 'employer' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10"
                >
                  <div className="flex items-center space-x-3">
                    <Search className="w-5 h-5 text-white/70" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search jobs by title or location..."
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/50 backdrop-blur-xl focus:outline-none focus:border-somnia-purple/50"
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Live Jobs Grid - Filtered by profile */}
            {profile === 'worker' && jobsCount > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">Available Jobs</h2>
                  <p className="text-white/70 font-mono text-sm">
                    Showing {Math.min(Number(jobsCount), 12)} of {jobsCount}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: Math.min(Number(jobsCount), 12) }, (_, i) => {
                    const jobId = BigInt(Number(jobsCount) - i)
                    return <JobCard key={jobId.toString()} jobId={jobId} />
                  })}
                </div>
              </div>
            ) : profile === 'employer' && jobsCount > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">All Jobs</h2>
                  <p className="text-white/70 font-mono text-sm">
                    Showing {Math.min(Number(jobsCount), 12)} of {jobsCount}
                  </p>
                </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: Math.min(Number(jobsCount), 12) }, (_, i) => {
                  const jobId = BigInt(Number(jobsCount) - i)
                  return <JobCard key={jobId.toString()} jobId={jobId} />
                })}
                </div>
              </div>
            ) : profile === 'worker' ? (
              <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-12 border border-white/10 text-center">
                <p className="text-white/70 text-lg mb-4">No jobs available yet</p>
                <p className="text-white/50 text-sm mb-6">Check back later for new opportunities</p>
              </div>
            ) : (
              <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-12 border border-white/10 text-center">
                <p className="text-white/70 text-lg mb-4">No jobs posted yet</p>
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

            {/* AI Features Section - Profile specific */}
            {profile === 'worker' && (
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

                {/* AI Tools for Workers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AIJobMatcher />
                <AIBidOptimizer />
              </div>
            </div>
            )}

            {profile === 'employer' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-somnia-purple to-mx-green rounded-xl flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">AI-Powered Insights</h2>
                    <p className="text-white/60 text-sm">Powered by Google Gemini</p>
                  </div>
                </div>

                {/* AI Insights for Employers */}
                <AIInsightsPanel />
              </div>
            )}

            {/* Quick Links - Profile specific */}
            <div className={`grid grid-cols-1 md:grid-cols-2 ${profile === 'worker' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
              {profile === 'worker' && (
              <Link href="/gigstream/my-jobs">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="backdrop-blur-xl bg-gradient-to-r from-somnia-cyan/20 to-mx-green/20 rounded-3xl p-8 border border-somnia-cyan/30 shadow-neural-glow cursor-pointer"
                >
                  <h3 className="text-2xl font-bold text-white mb-2">My Jobs</h3>
                    <p className="text-white/70 font-mono">Manage assigned jobs</p>
                  </motion.div>
                </Link>
              )}
              {profile === 'employer' && (
                <Link href="/gigstream/my-jobs">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="backdrop-blur-xl bg-gradient-to-r from-somnia-purple/20 to-mx-green/20 rounded-3xl p-8 border border-somnia-purple/30 shadow-neural-glow cursor-pointer"
                  >
                    <h3 className="text-2xl font-bold text-white mb-2">My Posted Jobs</h3>
                    <p className="text-white/70 font-mono">Manage your job listings</p>
                </motion.div>
              </Link>
              )}
              <Link href="/gigstream/profile">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="backdrop-blur-xl bg-gradient-to-r from-somnia-purple/20 to-mx-green/20 rounded-3xl p-8 border border-somnia-purple/30 shadow-neural-glow cursor-pointer"
                >
                  <h3 className="text-2xl font-bold text-white mb-2">My Profile</h3>
                  <p className="text-white/70 font-mono">
                    {profile === 'worker' ? 'View reputation and stats' : 'View profile and stats'}
                  </p>
                </motion.div>
              </Link>
              {profile === 'worker' && (
                <Link href="/gigstream/help/reputation">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="backdrop-blur-xl bg-gradient-to-r from-somnia-cyan/20 to-mx-green/20 rounded-3xl p-8 border border-somnia-cyan/30 shadow-neural-glow cursor-pointer"
                  >
                    <h3 className="text-2xl font-bold text-white mb-2">Reputation Help</h3>
                    <p className="text-white/70 font-mono">Learn about reputation</p>
                  </motion.div>
                </Link>
              )}
              <LiveEventsPanel maxEvents={10} />
            </div>
          </div>
        )}
      </main>
      <Footer />
      <GeminiBot />
    </div>
  )
}

