'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Rocket } from 'lucide-react'
import { useAccount } from 'wagmi'
import BlockchainNetwork from './BlockchainNetwork'

export default function CTASection() {
  const { isConnected } = useAccount()

  return (
    <section id="cta" className="py-20 bg-gradient-to-b from-somnia-dark to-somnia-dark/95 relative overflow-hidden neural-bg">
      <BlockchainNetwork />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="backdrop-blur-xl bg-gradient-to-r from-somnia-purple/20 via-somnia-cyan/20 to-mx-green/20 border border-somnia-purple/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 neural-hover relative overflow-hidden group">
            <div className="neural-shimmer absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <motion.div
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="mb-4 sm:mb-6 relative z-10"
            >
              <Rocket className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-mx-green mx-auto mb-3 sm:mb-4 drop-shadow-[0_0_20px_hsl(var(--mx-green)/0.6)]" />
            </motion.div>
            
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 sm:mb-4 neural-text px-2">
                Ready to Get Started?
              </h2>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
                {isConnected ? (
                  <Link href="/gigstream" className="w-full sm:w-auto">
                    <motion.button
                      className="group w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-somnia-purple via-somnia-cyan to-mx-green rounded-xl sm:rounded-2xl text-white font-bold text-base sm:text-lg shadow-neural-glow-xl flex items-center justify-center space-x-3 neural-hover"
                      whileHover={{ scale: 1.05, y: -2 }}
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
                        className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl text-white font-bold text-base sm:text-lg transition-all neural-hover"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Browse Jobs
                      </motion.button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
