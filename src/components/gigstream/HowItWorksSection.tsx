'use client'

import { motion } from 'framer-motion'
import { UserPlus, Search, Handshake, CheckCircle, ArrowRight, Sparkles, Wallet, Network } from 'lucide-react'
import BlockchainNetwork from './BlockchainNetwork'

export default function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      icon: Wallet,
      title: 'Connect Wallet',
      description: 'Sign in with your Web3 wallet via Reown AppKit or email. Get instant access to STT test tokens for gas-free transactions on Somnia testnet.',
      technical: 'Reown AppKit • WalletConnect • STT faucet • Gas-free testing',
      color: 'from-somnia-purple to-purple-400'
    },
    {
      number: '02',
      icon: Search,
      title: 'AI-Powered Job Posting',
      description: 'Employers post jobs with intelligent AI-suggested titles powered by Google Gemini. Smart categorization and skill matching. Workers browse live job stream updated in real-time via Somnia Data Streams.',
      technical: 'Google Gemini AI • AI job suggestions • Smart categorization • Somnia Data Streams • WebSocket • Real-time feeds',
      color: 'from-somnia-cyan via-mx-green to-emerald-400'
    },
    {
      number: '03',
      icon: Handshake,
      title: 'Match & Accept',
      description: 'Workers place bids instantly. Employers review on-chain reputation scores and accept the best match. Smart contract escrow automatically locks payment.',
      technical: 'On-chain reputation • Smart escrow • Instant matching • Reputation scoring',
      color: 'from-scroll-gold to-yellow-400'
    },
    {
      number: '04',
      icon: CheckCircle,
      title: 'Complete & Get Paid',
      description: 'Work completed? Smart contract auto-releases payment. Build verifiable on-chain reputation. Repeat. All transactions finalize in under 2 seconds on Somnia.',
      technical: 'Auto-release escrow • On-chain reputation • Sub-second finality • 400k+ TPS',
      color: 'from-cyan-400 to-blue-400'
    }
  ]

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-somnia-dark to-somnia-dark/95 relative overflow-hidden neural-bg">
      <BlockchainNetwork />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
            <Network className="w-6 h-6 sm:w-8 sm:h-8 text-somnia-purple mx-auto" />
          </motion.div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6 px-4">
            <span className="neural-text text-neural-glow-lg">
              How It Works
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed px-4">
            Simple, fast, and secure. 
            <span className="text-somnia-cyan font-semibold"> Get started in minutes</span> with blockchain-powered freelance work.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-somnia-purple via-mx-green to-somnia-purple opacity-20 transform -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 relative">
            {steps.map((step, idx) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="relative"
              >
                {/* Arrow (Desktop) */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 z-10">
                    <ArrowRight className="w-6 h-6 lg:w-8 lg:h-8 text-somnia-purple/50" />
                  </div>
                )}

                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 hover:border-somnia-purple/50 transition-all duration-500 hover:shadow-neural-glow-xl h-full neural-hover relative overflow-hidden group">
                  <div className="neural-shimmer absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Number Badge */}
                  <motion.div
                    className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-somnia-dark to-somnia-dark/80 rounded-full border-2 sm:border-4 border-somnia-dark flex items-center justify-center shadow-neural-glow"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <span className="text-lg sm:text-xl lg:text-2xl font-black neural-text">
                      {step.number}
                    </span>
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br ${step.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mt-2 sm:mt-4 shadow-neural-glow`}
                    whileHover={{ scale: 1.15, rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <step.icon className="w-7 h-7 sm:w-8 lg:w-10 lg:h-10 text-white" />
                  </motion.div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4 group-hover:text-somnia-cyan transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-white/80 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
                      {step.description}
                    </p>
                    <div className="pt-3 sm:pt-4 border-t border-white/10">
                      <p className="text-[10px] sm:text-xs text-white/50 font-mono leading-relaxed">
                        {step.technical}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

