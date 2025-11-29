'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowUp, Twitter, ExternalLink } from 'lucide-react'

export default function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const productLinks = [
    { name: 'Dashboard', href: '/gigstream' },
    { name: 'Marketplace', href: '/gigstream/marketplace' },
    { name: 'Post Job', href: '/gigstream/post' },
    { name: 'My Jobs', href: '/gigstream/my-jobs' },
    { name: 'Profile', href: '/gigstream/profile' }
  ]

  const resourcesLinks = [
    { name: 'Live Demo', href: 'https://gigstream-mx.vercel.app', external: true },
    { name: 'Smart Contracts', href: 'https://shannon-explorer.somnia.network/address/0x8D742671508E1C5BFF77f3d0AE70218C8Cc57Cef', external: true },
    { name: 'Somnia Docs', href: 'https://docs.somnia.network', external: true },
    { name: 'Somnia Explorer', href: 'https://shannon-explorer.somnia.network', external: true }
  ]

  const socialLinks = [
    { name: 'X (Twitter)', href: 'https://twitter.com/somnia_network', icon: Twitter }
  ]

  return (
    <footer className="relative bg-gradient-to-b from-somnia-dark to-black border-t border-somnia-cyan/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Product */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wide text-sm">Product</h4>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-white/60 hover:text-[#00D4FF] transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wide text-sm">Resources</h4>
            <ul className="space-y-2">
              {resourcesLinks.map((link) => (
                <li key={link.name}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-white/60 hover:text-[#00D4FF] transition-colors text-sm"
                    >
                      <span>{link.name}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <Link href={link.href} className="text-white/60 hover:text-[#00D4FF] transition-colors text-sm">
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wide text-sm">Follow Us</h4>
            <ul className="space-y-2">
              {socialLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-white/60 hover:text-[#00D4FF] transition-colors text-sm"
                  >
                    <link.icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wide text-sm">About</h4>
            <p className="text-white/60 text-sm mb-4 leading-relaxed">
              Real-time freelance marketplace powered by Somnia Data Streams & Google Gemini AI. 
              Connecting workers and employers worldwide.
            </p>
            <div className="space-y-2">
              <p className="text-white/60 text-xs">
                <span className="text-white/80 font-semibold">Built on:</span> Somnia Network (Testnet)
              </p>
              <p className="text-white/60 text-xs">
                <span className="text-white/80 font-semibold">Chain ID:</span> 50312
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-4 md:space-y-0">
            <div className="text-white/60 text-xs sm:text-sm text-center sm:text-left">
              © 2025 GigStream. Built on Somnia Network.
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 md:space-x-6">
              <span className="text-white/80 text-xs sm:text-sm font-semibold text-center sm:text-left">
                Made by <span className="text-somnia-cyan">Vaiosx</span> and <span className="text-somnia-cyan">M0nsxx</span>
              </span>
              <span className="text-white/60 text-xs sm:text-sm text-center sm:text-left">Powered by Somnia Network</span>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top - Bottom Left */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={scrollToTop}
            className="fixed bottom-4 left-4 sm:bottom-8 sm:left-8 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-[#00D4FF] to-[#7B00FF] rounded-full flex items-center justify-center text-white shadow-neural-glow-lg z-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Back to top"
          >
            <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  )
}

