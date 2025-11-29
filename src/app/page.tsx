'use client'

import { motion } from 'framer-motion'
import Navbar from '@/components/somnia/Navbar'
import Footer from '@/components/somnia/Footer'
import HeroSection from '@/components/gigstream/HeroSection'
import MarketplaceSearch from '@/components/gigstream/MarketplaceSearch'
import FeaturesSection from '@/components/gigstream/FeaturesSection'
import BenefitsSection from '@/components/gigstream/BenefitsSection'
import HowItWorksSection from '@/components/gigstream/HowItWorksSection'
import WhatWeDoSection from '@/components/gigstream/WhatWeDoSection'
import SomniaSDKSection from '@/components/gigstream/SomniaSDKSection'
import LiveEventsPanel from '@/components/gigstream/LiveEventsPanel'
// Somnia Network Sections - Integrated
import TechnologySection from '@/components/somnia/TechnologySection'
import MultiStreamSection from '@/components/somnia/MultiStreamSection'
import CTASection from '@/components/gigstream/CTASection'
import GeminiBot from '@/components/chatbot/GeminiBot'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-blue via-somnia-purple/20 to-mx-green/10">
      <Navbar />
      <main>
        {/* GigStream Sections */}
        <HeroSection />
        <MarketplaceSearch />
        <FeaturesSection />
        <BenefitsSection />
        <HowItWorksSection />
        <WhatWeDoSection />
        <SomniaSDKSection />
        
        {/* Live Events Panel - Showcase Data Streams in Action */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-somnia-dark/50 to-somnia-dark/30 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-6xl mx-auto"
            >
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-somnia-purple to-mx-green bg-clip-text text-transparent mb-3 sm:mb-4 px-4">
                  Live Marketplace Activity
                </h2>
                <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto px-4">
                  Watch jobs, bids, and completions happen in real-time powered by Somnia Data Streams
                </p>
              </div>
              <LiveEventsPanel maxEvents={8} />
            </motion.div>
          </div>
        </section>
        
        {/* Somnia Network - Consolidated Key Features */}
        <TechnologySection />
        <MultiStreamSection />
        
        {/* Final CTA */}
        <CTASection />
      </main>
      <Footer />
      <GeminiBot />
    </div>
  )
}

