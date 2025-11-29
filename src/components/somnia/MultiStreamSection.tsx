'use client'

import { motion } from 'framer-motion'
import { Zap, Network, TrendingUp, Shield, ArrowRight } from 'lucide-react'
import BlockchainNetwork from '@/components/gigstream/BlockchainNetwork'

export default function MultiStreamSection() {
  const features = [
    {
      icon: Network,
      title: 'Independent Data Chains',
      description: 'Each validator runs its own independent data chain, enabling parallel block production and massive scalability.',
      color: 'from-[#00D4FF] to-cyan-400'
    },
    {
      icon: Zap,
      title: 'Modified PBFT Consensus',
      description: 'Consensus chain aggregates block heads from all validators using a modified Practical Byzantine Fault Tolerance algorithm.',
      color: 'from-[#7B00FF] to-purple-400'
    },
    {
      icon: TrendingUp,
      title: 'Parallel Block Production',
      description: 'Multiple validators produce blocks simultaneously, achieving 400k+ TPS with sub-second finality.',
      color: 'from-cyan-400 to-[#00D4FF]'
    },
    {
      icon: Shield,
      title: 'Byzantine Fault Tolerance',
      description: 'Network remains secure and operational even with up to 33% of validators acting maliciously.',
      color: 'from-purple-400 to-pink-400'
    }
  ]

  const metrics = [
    { label: 'Validators', value: '100+', color: 'from-[#00D4FF] to-[#7B00FF]' },
    { label: 'TPS Capacity', value: '400k+', color: 'from-[#7B00FF] to-purple-400' },
    { label: 'Finality', value: '<1s', color: 'from-cyan-400 to-[#00D4FF]' },
    { label: 'Block Time', value: '~100ms', color: 'from-purple-400 to-pink-400' }
  ]

  return (
    <section id="multistream" className="py-16 bg-gradient-to-b from-somnia-dark to-somnia-dark/95 relative overflow-hidden neural-bg">
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
              MultiStream Consensus
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed px-4">
            Revolutionary consensus mechanism enabling parallel block production across independent validator chains.
            <span className="text-somnia-cyan font-semibold"> The foundation of Somnia&apos;s 400k+ TPS performance.</span>
          </p>
        </motion.div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="backdrop-blur-xl bg-white/5 border border-somnia-cyan/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 hover:border-somnia-cyan/50 transition-all neural-hover"
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br ${feature.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6`}>
                <feature.icon className="w-6 h-6 sm:w-7 sm:w-7 lg:w-8 lg:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">{feature.title}</h3>
              <p className="text-white/70 leading-relaxed text-sm sm:text-base">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="backdrop-blur-xl bg-white/5 border border-somnia-cyan/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-12 sm:mb-16"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">Performance Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {metrics.map((metric, idx) => (
              <div key={metric.label} className="text-center">
                <div className={`text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r ${metric.color} bg-clip-text text-transparent mb-1 sm:mb-2`}>
                  {metric.value}
                </div>
                <div className="text-white/70 uppercase tracking-wide text-xs sm:text-sm">{metric.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="backdrop-blur-xl bg-white/5 border border-somnia-cyan/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">How MultiStream Works</h3>
          <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
            {[
              {
                step: '1',
                title: 'Independent Chains',
                description: 'Each validator maintains its own data chain, processing transactions independently and in parallel.'
              },
              {
                step: '2',
                title: 'Block Head Aggregation',
                description: 'The consensus chain collects block heads from all validators, creating a unified view of the network state.'
              },
              {
                step: '3',
                title: 'PBFT Consensus',
                description: 'Validators reach consensus on the aggregated state using modified PBFT, ensuring security and finality.'
              },
              {
                step: '4',
                title: 'Sub-Second Finality',
                description: 'Transactions are finalized in less than one second, enabling real-time applications at Web2 scale.'
              }
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start space-x-3 sm:space-x-4"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#00D4FF] to-[#7B00FF] rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg sm:text-xl">{item.step}</span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">{item.title}</h4>
                  <p className="text-white/70 text-sm sm:text-base">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

