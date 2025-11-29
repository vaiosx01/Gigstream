'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, TrendingUp, Users, DollarSign, Clock, Shield, Sparkles, Zap, Globe, Lock, Award, Target } from 'lucide-react'
import BlockchainNetwork from './BlockchainNetwork'

export default function BenefitsSection() {
  const workerBenefits = [
    {
      text: 'Keep 100% of earnings - zero platform fees',
      icon: DollarSign,
      highlight: '100% earnings'
    },
    {
      text: 'Instant payment on work completion via smart contract auto-release',
      icon: Zap,
      highlight: 'Instant payments'
    },
    {
      text: 'Build verifiable, portable reputation on-chain with ERC-20 reputation tokens',
      icon: Award,
      highlight: 'On-chain reputation'
    },
    {
      text: 'Access to job opportunities worldwide in real-time',
      icon: Globe,
      highlight: '56M+ opportunities'
    },
    {
      text: 'Work on your schedule, 24/7 availability with instant job matching',
      icon: Clock,
      highlight: '24/7 availability'
    },
    {
      text: 'Secure smart contract escrow protects your work and payments',
      icon: Shield,
      highlight: 'Secure escrow'
    },
    {
      text: 'Transparent on-chain reputation system with verifiable work history',
      icon: Lock,
      highlight: 'On-chain reputation'
    },
    {
      text: 'AI-powered job matching finds the best opportunities for your skills',
      icon: Target,
      highlight: 'AI matching'
    }
  ]

  const employerBenefits = [
    {
      text: 'Post jobs in under 2 seconds with sub-second finality on Somnia',
      icon: Zap,
      highlight: '<2s posting'
    },
    {
      text: 'AI-powered job title suggestions via Google Gemini',
      icon: Sparkles,
      highlight: 'AI suggestions'
    },
    {
      text: 'Instant matching with qualified workers via real-time Data Streams',
      icon: Users,
      highlight: 'Instant matching'
    },
    {
      text: 'Automated escrow and payment release via smart contracts',
      icon: Lock,
      highlight: 'Auto escrow'
    },
    {
      text: 'Transparent on-chain reputation system with verified work history',
      icon: Award,
      highlight: 'Transparent reputation'
    },
    {
      text: 'Access to workers worldwide with local expertise',
      icon: Globe,
      highlight: '56M+ workers'
    },
    {
      text: 'Zero platform fees - pay only gas costs for transactions',
      icon: DollarSign,
      highlight: 'Zero fees'
    },
    {
      text: 'Real-time job feeds and bid updates via WebSocket streams',
      icon: TrendingUp,
      highlight: 'Real-time updates'
    }
  ]

  return (
    <section id="benefits" className="py-20 bg-gradient-to-b from-somnia-dark/50 to-somnia-dark relative neural-bg overflow-hidden">
      <BlockchainNetwork />
      {/* Neural Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-1/4 left-0 w-96 h-96 bg-mx-green rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute bottom-1/4 right-0 w-96 h-96 bg-somnia-purple rounded-full blur-3xl"
        />
      </div>

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
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-somnia-purple mx-auto" />
          </motion.div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6 px-4">
            <span className="neural-text text-neural-glow-lg">
              Benefits
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed px-4">
            Built for workers and employers. 
            <span className="text-somnia-cyan font-semibold"> Fair, fast, and transparent</span> with blockchain technology.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* For Workers */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="backdrop-blur-xl bg-white/5 border border-mx-green/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 neural-hover relative overflow-hidden group"
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="neural-shimmer absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-br from-mx-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6 sm:mb-8">
                <motion.div
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-mx-green to-emerald-400 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-neural-glow flex-shrink-0"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">For Workers</h3>
                  <p className="text-white/70 text-base sm:text-lg">Maximize your earnings and opportunities</p>
                </div>
              </div>
              <ul className="space-y-4">
                {workerBenefits.map((benefit, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08, type: 'spring' }}
                    className="flex items-start space-x-3 sm:space-x-4 group/item"
                  >
                    <motion.div
                      className="flex-shrink-0 mt-1"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.3 }}
                    >
                      <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6 text-mx-green" />
                    </motion.div>
                    <div className="flex-1">
                      <span className="text-white/90 text-base sm:text-lg leading-relaxed block">
                        {benefit.text.split(benefit.highlight).map((part, i) => (
                          <span key={i}>
                            {part}
                            {i < benefit.text.split(benefit.highlight).length - 1 && (
                              <span className="text-mx-green font-semibold">{benefit.highlight}</span>
                            )}
                          </span>
                        ))}
                      </span>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* For Employers */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="backdrop-blur-xl bg-white/5 border border-somnia-purple/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 neural-hover relative overflow-hidden group"
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="neural-shimmer absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-br from-somnia-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6 sm:mb-8">
                <motion.div
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-somnia-purple to-purple-400 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-neural-glow flex-shrink-0"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">For Employers</h3>
                  <p className="text-white/70 text-base sm:text-lg">Find talent instantly and efficiently</p>
                </div>
              </div>
              <ul className="space-y-4">
                {employerBenefits.map((benefit, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08, type: 'spring' }}
                    className="flex items-start space-x-3 sm:space-x-4 group/item"
                  >
                    <motion.div
                      className="flex-shrink-0 mt-1"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.3 }}
                    >
                      <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6 text-somnia-purple" />
                    </motion.div>
                    <div className="flex-1">
                      <span className="text-white/90 text-base sm:text-lg leading-relaxed block">
                        {benefit.text.split(benefit.highlight).map((part, i) => (
                          <span key={i}>
                            {part}
                            {i < benefit.text.split(benefit.highlight).length - 1 && (
                              <span className="text-somnia-purple font-semibold">{benefit.highlight}</span>
                            )}
                          </span>
                        ))}
                      </span>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Value Proposition Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 sm:mt-16 backdrop-blur-xl bg-gradient-to-r from-somnia-purple/20 via-somnia-cyan/20 to-mx-green/20 border border-somnia-purple/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-black neural-text mb-1 sm:mb-2">100%</div>
              <div className="text-white/80 text-base sm:text-lg mb-1">Earnings Retention</div>
              <div className="text-white/60 text-xs sm:text-sm">Workers keep everything</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-black neural-text mb-1 sm:mb-2">&lt;2s</div>
              <div className="text-white/80 text-base sm:text-lg mb-1">Job Posting Time</div>
              <div className="text-white/60 text-xs sm:text-sm">Sub-second finality</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-black neural-text mb-1 sm:mb-2">$0</div>
              <div className="text-white/80 text-base sm:text-lg mb-1">Platform Fees</div>
              <div className="text-white/60 text-xs sm:text-sm">Zero cost model</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

