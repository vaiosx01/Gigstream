// src/components/gigstream/SomniaSDKSection.tsx - Somnia SDK Information Section
'use client'

import { motion } from 'framer-motion'
import { Database, Code, Zap, Shield, Network, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function SomniaSDKSection() {
  const features = [
    {
      icon: Database,
      title: 'Structured Data Streams',
      description: 'Publish and query structured job data using schema-based encoding. All jobs automatically indexed in Somnia Data Streams for fast retrieval.',
      color: 'from-somnia-cyan to-cyan-400'
    },
    {
      icon: Code,
      title: 'Official SDK Integration',
      description: 'Built with @somnia-chain/streams SDK v0.11.0. Full TypeScript support, comprehensive error handling, and production-ready integration.',
      color: 'from-somnia-purple to-purple-400'
    },
    {
      icon: Zap,
      title: 'Real-Time Publishing',
      description: 'Jobs automatically published to Data Streams when created. Event-driven architecture ensures instant availability across the network.',
      color: 'from-mx-green to-emerald-400'
    },
    {
      icon: Network,
      title: 'High-Throughput Network',
      description: 'Leverage Somnia\'s 400k+ TPS capacity for real-time job matching. Sub-second finality ensures instant job availability.',
      color: 'from-somnia-cyan to-blue-400'
    },
    {
      icon: Shield,
      title: 'On-Chain Schema Registry',
      description: 'Job schemas registered on-chain for verifiable data structure. Query by publisher, schema, or timestamp with full transparency.',
      color: 'from-somnia-purple to-pink-400'
    },
    {
      icon: Sparkles,
      title: 'Dual Data Sources',
      description: 'Combine contract events (real-time) with Data Streams (indexed). Best of both worlds: instant updates and structured queries.',
      color: 'from-mx-green to-yellow-400'
    }
  ]

  return (
    <section id="somnia-sdk" className="py-20 bg-gradient-to-b from-somnia-dark/95 to-somnia-dark relative neural-bg overflow-hidden">
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
            <Database className="w-10 h-10 sm:w-12 sm:h-12 text-somnia-cyan mx-auto drop-shadow-[0_0_20px_hsl(var(--somnia-cyan)/0.6)]" />
          </motion.div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6 px-4">
            <span className="neural-text text-neural-glow-lg">
              Powered by Somnia Data Streams SDK
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed px-4">
            Built on the official <span className="text-somnia-cyan font-semibold">@somnia-chain/streams</span> SDK for 
            structured data publishing, real-time event streaming, and high-throughput job matching.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 neural-hover relative overflow-hidden"
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <div className="relative z-10">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${feature.color} rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-neural-glow`}>
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-white/70 text-xs sm:text-sm leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="backdrop-blur-xl bg-gradient-to-r from-somnia-purple/20 via-somnia-cyan/20 to-mx-green/20 border border-somnia-purple/30 rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">SDK Version & Integration</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-somnia-cyan mb-1 sm:mb-2">v0.11.0</div>
                <div className="text-white/70 text-xs sm:text-sm">SDK Version</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-mx-green mb-1 sm:mb-2">100%</div>
                <div className="text-white/70 text-xs sm:text-sm">TypeScript</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-somnia-purple mb-1 sm:mb-2">Vitest</div>
                <div className="text-white/70 text-xs sm:text-sm">Integration Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-scroll-gold mb-1 sm:mb-2">Hardhat</div>
                <div className="text-white/70 text-xs sm:text-sm">Contract Dev</div>
              </div>
            </div>
            <p className="text-white/80 mb-4 sm:mb-6 text-sm sm:text-base">
              All jobs are automatically published to Somnia Data Streams using structured schemas. 
              Query jobs by publisher, filter by location, and access real-time updates via the official SDK.
            </p>
            <Link href="https://docs.somnia.network" target="_blank" rel="noopener noreferrer">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-somnia-cyan to-somnia-purple rounded-lg sm:rounded-xl text-white font-bold text-sm sm:text-base shadow-neural-glow"
              >
                <span>View SDK Documentation</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

