'use client'

import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import Link from 'next/link'
import { ArrowRight, Zap, TrendingUp, Users, Clock, Network, Shield, Sparkles, Brain } from 'lucide-react'
import { useEffect, useState } from 'react'
import BlockchainNetwork from './BlockchainNetwork'

export default function HeroSection() {
  const { isConnected } = useAccount()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section id="home" className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-20 sm:pt-24 pb-8 sm:pb-12 neural-bg">
      <BlockchainNetwork />
      {/* Advanced Neural Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-neural-blue via-somnia-purple/20 to-mx-green/10">
        {/* Animated Neural Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-somnia-purple rounded-full blur-3xl"
          style={{
            boxShadow: '0 0 200px hsl(var(--somnia-purple) / 0.5)',
          }}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.6, 0.3],
            x: [0, -80, 0],
            y: [0, -60, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-mx-green rounded-full blur-3xl"
          style={{
            boxShadow: '0 0 200px hsl(var(--mx-green) / 0.5)',
          }}
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.5, 0.2],
            x: [0, 50, 0],
            y: [0, -80, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 right-1/3 w-80 h-80 bg-somnia-cyan rounded-full blur-3xl"
          style={{
            boxShadow: '0 0 200px hsl(var(--somnia-cyan) / 0.4)',
          }}
        />
      </div>

      {/* Neural Particles */}
      <div className="neural-particles">
        {Array.from({ length: 6 }).map((_, i) => {
          // Use fixed positions to avoid hydration mismatch
          const positions = [
            { left: 10, top: 20 },
            { left: 30, top: 60 },
            { left: 70, top: 30 },
            { left: 50, top: 80 },
            { left: 85, top: 15 },
            { left: 15, top: 70 },
          ]
          const pos = positions[i] || { left: 50, top: 50 }
          
          return (
            <motion.div
              key={i}
              className="neural-particle"
              initial={{
                left: `${pos.left}%`,
                top: `${pos.top}%`,
              }}
              animate={{
                x: [0, (i % 2 === 0 ? 1 : -1) * 100],
                y: [0, (i % 3 === 0 ? 1 : -1) * 80],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 4 + (i * 0.3),
                repeat: Infinity,
                delay: i * 0.3,
              }}
              style={{
                willChange: 'transform, opacity',
                transform: 'translateZ(0)',
              }}
            />
          )
        })}
      </div>

      {/* Mouse Follow Neural Glow */}
      <motion.div
        className="absolute w-96 h-96 bg-somnia-purple rounded-full blur-3xl opacity-20 pointer-events-none"
        animate={{
          x: mousePosition.x - 192,
          y: mousePosition.y - 192,
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8"
          >
            <motion.div
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 backdrop-blur-xl bg-white/5 border border-somnia-purple/30 rounded-full"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-somnia-purple flex-shrink-0" />
              <span className="text-xs sm:text-sm text-white/80">Powered by Somnia Data Streams • Sub-Second Finality</span>
            </motion.div>
            <motion.div
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 backdrop-blur-xl bg-gradient-to-r from-somnia-cyan/20 to-somnia-purple/20 border border-somnia-cyan/40 rounded-full"
              whileHover={{ scale: 1.05 }}
            >
              <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-somnia-cyan flex-shrink-0" />
              <span className="text-xs sm:text-sm text-white/90 font-semibold">AI-Powered with Google Gemini</span>
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-3 sm:mb-4 leading-tight px-2"
          >
            <span className="neural-text text-neural-glow-lg">
              GigStream
            </span>
            <br />
            <span className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">Global Real-Time Freelance Marketplace</span>
            <br />
            <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-white/70 font-bold">
              Built on Somnia Network
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-3 max-w-3xl mx-auto leading-relaxed font-medium px-4"
          >
            Connect freelancers and workers worldwide with real-time job opportunities
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-sm sm:text-base md:text-lg text-white/70 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4"
          >
            <span className="text-mx-green font-semibold">Powered by Somnia Data Streams</span> and 
            <span className="text-somnia-cyan font-semibold"> Google Gemini AI</span> – 
            Instant job matching with intelligent suggestions, instant payments, zero fees. 
            Leveraging <span className="text-somnia-cyan font-semibold">400k+ TPS</span>, 
            <span className="text-somnia-purple font-semibold"> sub-second finality</span>, and 
            <span className="text-somnia-cyan font-semibold"> AI-powered job recommendations</span> for real-time freelance work.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 px-4"
          >
            {isConnected ? (
              <Link href="/gigstream" className="w-full sm:w-auto">
                <motion.button
                  className="group w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-somnia-purple via-somnia-cyan to-mx-green rounded-2xl text-white font-bold text-base sm:text-lg shadow-neural-glow-xl flex items-center justify-center space-x-3 neural-hover"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    backgroundSize: '200% 200%',
                    animation: 'neuralFlow 3s ease infinite',
                  }}
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            ) : (
              <>
                <div className="w-full sm:w-auto">
                  <appkit-button />
                </div>
                <Link href="/gigstream" className="w-full sm:w-auto">
                  <motion.button
                    className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl text-white font-bold text-base sm:text-lg transition-all neural-hover"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Explore Jobs
                  </motion.button>
                </Link>
              </>
            )}
          </motion.div>

          {/* Enhanced Stats with Neural Effects */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto px-4"
          >
            {[
              { icon: Users, value: 'Global', label: 'Workers', color: 'from-mx-green to-emerald-400', desc: 'Worldwide' },
              { icon: Zap, value: '<2s', label: 'Matching', color: 'from-somnia-purple to-purple-400', desc: 'Real-Time' },
              { icon: Network, value: '400k+', label: 'TPS', color: 'from-somnia-cyan to-cyan-400', desc: 'Somnia Network' },
              { icon: TrendingUp, value: 'Global', label: 'Market', color: 'from-scroll-gold to-yellow-400', desc: 'Opportunity' }
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.7 + idx * 0.1, type: 'spring' }}
                className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 neural-hover relative overflow-hidden"
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity" style={{
                  background: `linear-gradient(135deg, ${stat.color.split(' ')[1]}, ${stat.color.split(' ')[3]})`
                }} />
                <div className="relative z-10">
                  <div className={`w-12 h-12 sm:w-14 sm:h-16 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-2 sm:mb-4 mx-auto group-hover:scale-110 transition-transform shadow-neural-glow`}>
                    <stat.icon className="w-6 h-6 sm:w-8 text-white" />
                  </div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1 neural-text">{stat.value}</div>
                  <div className="text-white/80 text-xs sm:text-sm uppercase tracking-wide font-bold mb-1">{stat.label}</div>
                  <div className="text-white/50 text-[10px] sm:text-xs">{stat.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Key Features Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-8 sm:mt-12 px-4"
          >
            {[
              'Zero Platform Fees',
              'Smart Contract Escrow',
              'On-Chain Reputation',
              'Gemini AI',
              'AI-Powered Matching',
              'Instant Payments',
              'Somnia Data Streams'
            ].map((feature, idx) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 + idx * 0.1 }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-full text-xs sm:text-sm text-white/80 hover:border-somnia-purple/50 transition-all"
              >
                {feature}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

