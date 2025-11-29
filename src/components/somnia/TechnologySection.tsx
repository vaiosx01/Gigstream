'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, Zap, Code, TrendingUp, ArrowRight, Sparkles } from 'lucide-react'
import BlockchainNetwork from '@/components/gigstream/BlockchainNetwork'

export default function TechnologySection() {
  const [hoveredTech, setHoveredTech] = useState<string | null>(null)

  const technologies = [
    {
      id: 'multistream',
      title: 'MultiStream Consensus',
      icon: Zap,
      description: 'Every validator runs independent data chains. Consensus chain aggregates heads via modified PBFT. Parallel block production = massive scale.',
      metrics: '400k+ TPS',
      color: 'from-[#00D4FF] to-cyan-400',
      details: [
        'Independent data chains per validator',
        'Modified PBFT consensus aggregation',
        'Parallel block production',
        'Sub-second finality'
      ]
    },
    {
      id: 'icedb',
      title: 'IceDB Database',
      icon: Database,
      description: '15-100ns read/write. Deterministic performance reports. Precise gas pricing based on actual resource usage.',
      metrics: '<1s Finality',
      color: 'from-[#7B00FF] to-purple-400',
      details: [
        '15-100ns read/write latency',
        'Deterministic performance',
        'Precise gas pricing',
        'Resource-based optimization'
      ]
    },
    {
      id: 'evm',
      title: 'Compiled EVM',
      icon: Code,
      description: 'EVM bytecode → x86 native code. 30x faster execution than traditional EVM.',
      metrics: '30x Faster',
      color: 'from-[#00D4FF] to-[#7B00FF]',
      details: [
        'EVM bytecode compilation',
        'x86 native code execution',
        '30x performance boost',
        'Full compatibility maintained'
      ]
    },
    {
      id: 'performance',
      title: 'Performance Metrics',
      icon: TrendingUp,
      description: 'Industry-leading throughput and finality for real-time applications.',
      metrics: '100 Validators',
      color: 'from-cyan-400 to-[#7B00FF]',
      details: [
        '400k+ TPS capacity',
        '<1s finality guarantee',
        '100+ global validators',
        '50% fee burn mechanism'
      ]
    }
  ]

  return (
    <section id="technology" className="py-16 bg-gradient-to-b from-somnia-dark to-somnia-dark/95 relative overflow-hidden neural-bg">
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
            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-somnia-cyan mx-auto" />
          </motion.div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6 px-4">
            <span className="neural-text text-neural-glow-lg">
              Technology
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed px-4">
            Powered by <span className="text-somnia-cyan font-semibold">Somnia Network</span>. Built for scale. Engineered for speed. 
            <span className="text-mx-green font-semibold"> Perfect for real-time freelance work.</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {technologies.map((tech, idx) => (
            <motion.div
              key={tech.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              onMouseEnter={() => setHoveredTech(tech.id)}
              onMouseLeave={() => setHoveredTech(null)}
              className="group relative"
            >
              <div className="h-full backdrop-blur-xl bg-white/5 border border-somnia-cyan/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 hover:border-somnia-cyan/50 transition-all duration-500 hover:shadow-neural-glow-xl neural-hover relative overflow-hidden group">
                <div className="neural-shimmer absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                {/* Icon */}
                <motion.div 
                  className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br ${tech.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-neural-glow relative z-10`}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <tech.icon className="w-6 h-6 sm:w-7 sm:w-7 lg:w-8 lg:h-8 text-white" />
                </motion.div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-3 relative z-10 group-hover:text-somnia-cyan transition-colors">{tech.title}</h3>

                {/* Metrics Badge */}
                <div className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r ${tech.color} rounded-full mb-3 sm:mb-4`}>
                  <span className="text-white font-bold text-xs sm:text-sm">{tech.metrics}</span>
                </div>

                {/* Description */}
                <p className="text-white/80 mb-4 sm:mb-6 leading-relaxed relative z-10 text-sm sm:text-base">{tech.description}</p>

                {/* Expandable Details */}
                <AnimatePresence>
                  {hoveredTech === tech.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 border-t border-white/10">
                        <ul className="space-y-2">
                          {tech.details.map((detail, i) => (
                            <li key={i} className="flex items-start space-x-2 text-white/60 text-sm">
                              <ArrowRight className="w-4 h-4 mt-0.5 text-[#00D4FF] flex-shrink-0" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparison Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 sm:mt-16 backdrop-blur-xl bg-white/5 border border-somnia-cyan/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">Performance Comparison</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {['Somnia', 'Solana', 'Ethereum L2s'].map((chain, idx) => (
              <div key={chain} className="text-center">
                <div className={`h-24 sm:h-28 md:h-32 ${idx === 0 ? 'sm:h-32' : idx === 1 ? 'sm:h-20' : 'sm:h-12'} bg-gradient-to-t ${idx === 0 ? 'from-[#00D4FF] to-[#7B00FF]' : 'from-white/20 to-white/10'} rounded-t-lg sm:rounded-t-xl mb-3 sm:mb-4`} />
                <p className="text-white font-bold text-sm sm:text-base">{chain}</p>
                <p className="text-white/60 text-xs sm:text-sm mt-1 sm:mt-2">
                  {idx === 0 ? '400k+ TPS' : idx === 1 ? '65k TPS' : '2-5k TPS'}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

