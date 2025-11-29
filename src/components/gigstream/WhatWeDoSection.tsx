'use client'

import { motion } from 'framer-motion'
import { Target, Globe, Zap, Users, Sparkles, TrendingUp } from 'lucide-react'
import BlockchainNetwork from './BlockchainNetwork'

export default function WhatWeDoSection() {
  const missions = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'Democratize access to work opportunities for workers worldwide. Bridge the gap between traditional economy and Web3 innovation.',
      color: 'from-somnia-purple to-purple-400'
    },
    {
      icon: Globe,
      title: 'The Problem',
      description: 'Workers worldwide lack access to fair job opportunities. Traditional platforms charge 20-30% fees. Payment delays. No reputation portability. Limited geographic reach.',
      color: 'from-red-400 to-orange-400'
    },
    {
      icon: Zap,
      title: 'Our Solution',
      description: 'Real-time job matching via Somnia Data Streams. Zero fees. Instant payments. Portable reputation. Accessible to workers worldwide.',
      color: 'from-mx-green to-emerald-400'
    },
    {
      icon: Users,
      title: 'The Impact',
      description: 'Unlock $10B informal economy. Enable financial inclusion. Build on-chain reputation. Create sustainable income streams for millions.',
      color: 'from-scroll-gold to-yellow-400'
    }
  ]

  return (
    <section id="what-we-do" className="py-20 bg-gradient-to-b from-somnia-dark/95 to-somnia-dark relative neural-bg overflow-hidden">
      <BlockchainNetwork />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block mb-3 sm:mb-4"
          >
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-mx-green mx-auto" />
          </motion.div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6 px-4">
            <span className="neural-text text-neural-glow-lg">
              What We Do
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed px-4">
            Transforming the global freelance economy through 
            <span className="text-somnia-cyan font-semibold"> blockchain technology</span> and real-time job matching.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {missions.map((mission, idx) => (
            <motion.div
              key={mission.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group relative"
            >
              <div className="h-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 hover:border-somnia-purple/50 transition-all duration-500 hover:shadow-neural-glow-xl neural-hover relative overflow-hidden group">
                <div className="neural-shimmer absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className={`absolute inset-0 bg-gradient-to-br ${mission.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <motion.div
                    className={`w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-gradient-to-br ${mission.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-neural-glow`}
                    whileHover={{ scale: 1.15, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <mission.icon className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 group-hover:text-somnia-cyan transition-colors">
                    {mission.title}
                  </h3>
                  <p className="text-white/80 leading-relaxed text-base sm:text-lg">
                    {mission.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 sm:mt-16 backdrop-blur-xl bg-gradient-to-r from-somnia-purple/20 via-somnia-cyan/20 to-mx-green/20 border border-somnia-purple/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 neural-hover"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative"
            >
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black neural-text mb-1 sm:mb-2">Global</div>
              <div className="text-white/80 text-base sm:text-lg uppercase tracking-wide font-bold mb-1">Workers</div>
              <div className="text-white/60 text-xs sm:text-sm">Worldwide reach</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative"
            >
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black neural-text mb-1 sm:mb-2">$10B</div>
              <div className="text-white/80 text-base sm:text-lg uppercase tracking-wide font-bold mb-1">Market Size</div>
              <div className="text-white/60 text-xs sm:text-sm">Annual opportunity</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative"
            >
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black neural-text mb-1 sm:mb-2">&lt;2s</div>
              <div className="text-white/80 text-base sm:text-lg uppercase tracking-wide font-bold mb-1">Job Matching</div>
              <div className="text-white/60 text-xs sm:text-sm">Sub-second finality</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

