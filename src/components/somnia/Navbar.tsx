'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useAccount, useDisconnect } from 'wagmi'
import { usePathname } from 'next/navigation'
import { Menu, X, Download, Zap, Briefcase, User, Plus, Home, Network, Code, Users, Map, Store } from 'lucide-react'
import { formatEther } from 'viem'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  const handleLinkClick = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    setIsMenuOpen(false)
    setActiveDropdown(null)
  }

  // Determine which menu to show based on current path
  const isGigStreamPage = pathname?.startsWith('/gigstream')
  const isHomePage = pathname === '/'

  const menuItems: Array<{
    name: string
    href: string
    icon?: any
    submenu?: Array<{ name: string; href: string; external?: boolean; icon?: any }>
  }> = isGigStreamPage
    ? [
        // GigStream Dashboard Menu
        { name: 'Home', href: '/', icon: Home },
        { name: 'Dashboard', href: '/gigstream', icon: Briefcase },
        { name: 'Marketplace', href: '/gigstream/marketplace', icon: Store },
        { name: 'My Jobs', href: '/gigstream/my-jobs', icon: Briefcase },
        { name: 'Post Job', href: '/gigstream/post', icon: Plus },
        { name: 'Profile', href: '/gigstream/profile', icon: User }
      ]
    : [
        // Home Page Menu - Solo páginas independientes
        { name: 'Home', href: '/', icon: Home },
        {
          name: 'GigStream',
          href: '/gigstream',
          icon: Briefcase,
          submenu: [
            { name: 'Dashboard', href: '/gigstream', icon: Briefcase },
            { name: 'Marketplace', href: '/gigstream/marketplace', icon: Store },
            { name: 'My Jobs', href: '/gigstream/my-jobs', icon: Briefcase },
            { name: 'Post Job', href: '/gigstream/post', icon: Plus },
            { name: 'Profile', href: '/gigstream/profile', icon: User }
          ]
        }
      ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'backdrop-blur-xl bg-somnia-dark/80 border-b border-somnia-cyan/20'
          : 'backdrop-blur-md bg-somnia-dark/40'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00D4FF] to-[#7B00FF] rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#00D4FF] to-[#7B00FF] rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black bg-gradient-to-r from-[#00D4FF] to-[#7B00FF] bg-clip-text text-transparent leading-tight">
                GigStream
              </span>
              {!isGigStreamPage && (
                <span className="hidden xs:block text-xs text-white/60 font-medium">Powered by Somnia</span>
              )}
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {menuItems.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.submenu && setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  onClick={(e) => {
                    if (item.href.includes('#')) {
                      const hashPart = item.href.split('#')[1]
                      if (hashPart) {
                        e.preventDefault()
                        // If it's a different page, navigate first then scroll
                        if (item.href.startsWith('/')) {
                          const [path, hash] = item.href.split('#')
                          window.location.href = path
                          setTimeout(() => {
                            const element = document.querySelector(`#${hash}`)
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                            }
                          }, 100)
                        } else {
                          handleLinkClick(`#${hashPart}`)
                        }
                      }
                    } else {
                      setIsMenuOpen(false)
                      setActiveDropdown(null)
                    }
                  }}
                  className="text-white/80 hover:text-[#00D4FF] transition-colors font-medium text-sm uppercase tracking-wide flex items-center space-x-1"
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.name}</span>
                </Link>
                {item.submenu && (
                  <AnimatePresence>
                    {activeDropdown === item.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 w-48 backdrop-blur-xl bg-somnia-dark/90 border border-somnia-cyan/20 rounded-xl p-2 shadow-neural-glow"
                      >
                        {item.submenu.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            target={sub.external ? '_blank' : undefined}
                            onClick={(e) => {
                              if (!sub.external) {
                                if (sub.href.includes('#')) {
                                  const hashPart = sub.href.split('#')[1]
                                  if (hashPart) {
                                    e.preventDefault()
                                    // If it's a different page, navigate first then scroll
                                    if (sub.href.startsWith('/')) {
                                      const [path, hash] = sub.href.split('#')
                                      window.location.href = path
                                      setTimeout(() => {
                                        const element = document.querySelector(`#${hash}`)
                                        if (element) {
                                          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                        }
                                      }, 100)
                                    } else {
                                      handleLinkClick(`#${hashPart}`)
                                    }
                                  }
                                } else {
                                  setIsMenuOpen(false)
                                  setActiveDropdown(null)
                                }
                              }
                            }}
                            className="px-4 py-2 text-white/70 hover:text-[#00D4FF] hover:bg-somnia-cyan/10 rounded-lg transition-colors text-sm flex items-center space-x-2"
                          >
                            {sub.icon && <sub.icon className="w-4 h-4" />}
                            <span>{sub.name}</span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-2 xl:space-x-3">
                <div className="px-3 xl:px-4 py-2 bg-gradient-to-r from-[#00D4FF]/20 to-[#7B00FF]/20 border border-somnia-cyan/30 rounded-xl">
                  <span className="text-[#00D4FF] font-mono text-xs xl:text-sm">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
                <motion.button
                  onClick={() => disconnect()}
                  className="px-4 xl:px-6 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7B00FF] rounded-xl text-white font-bold text-xs xl:text-sm hover:shadow-neural-glow transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Disconnect
                </motion.button>
              </div>
            ) : (
              <>
                <appkit-button />
                {isGigStreamPage ? (
                  <Link href="/gigstream/post">
                    <motion.button
                      className="px-4 xl:px-6 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7B00FF] rounded-xl text-white font-bold text-xs xl:text-sm hover:shadow-neural-glow transition-all flex items-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden xl:inline">Post Job</span>
                      <span className="xl:hidden">Post</span>
                    </motion.button>
                  </Link>
                ) : (
                  <Link href="/gigstream">
                    <motion.button
                      className="px-4 xl:px-6 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7B00FF] rounded-xl text-white font-bold text-xs xl:text-sm hover:shadow-neural-glow transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Get Started
                    </motion.button>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop overlay - Completely solid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black z-[45]"
            />
            {/* Mobile Menu Panel - Completely solid */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-[85vw] max-w-sm z-[50] shadow-2xl border-r border-somnia-cyan/20"
              style={{ backgroundColor: 'hsl(var(--somnia-dark))' }}
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#00D4FF] to-[#7B00FF] rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="text-lg sm:text-xl font-black bg-gradient-to-r from-[#00D4FF] to-[#7B00FF] bg-clip-text text-transparent">
                    GigStream
                  </span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Mobile Menu Content */}
              <div className="h-[calc(100vh-5rem)] overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
                {menuItems.map((item, idx) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="mb-3 sm:mb-4"
                  >
                    <Link
                      href={item.href}
                      onClick={(e) => {
                        if (item.href.includes('#')) {
                          const hashPart = item.href.split('#')[1]
                          if (hashPart) {
                            e.preventDefault()
                            // If it's a different page, navigate first then scroll
                            if (item.href.startsWith('/')) {
                              const [path, hash] = item.href.split('#')
                              window.location.href = path
                              setTimeout(() => {
                                const element = document.querySelector(`#${hash}`)
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                }
                              }, 100)
                            } else {
                              handleLinkClick(`#${hashPart}`)
                            }
                          }
                        } else {
                          setIsMenuOpen(false)
                        }
                      }}
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-lg sm:text-xl font-bold text-white hover:bg-white/10 hover:text-[#00D4FF] transition-all duration-200 active:bg-white/5"
                    >
                      {item.icon && <item.icon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />}
                      <span>{item.name}</span>
                    </Link>
                    {item.submenu && (
                      <div className="ml-4 sm:ml-6 mt-2 space-y-1">
                        {item.submenu.map((sub, subIdx) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            target={sub.external ? '_blank' : undefined}
                            onClick={(e) => {
                              if (!sub.external) {
                                if (sub.href.includes('#')) {
                                  const hashPart = sub.href.split('#')[1]
                                  if (hashPart) {
                                    e.preventDefault()
                                    // If it's a different page, navigate first then scroll
                                    if (sub.href.startsWith('/')) {
                                      const [path, hash] = sub.href.split('#')
                                      window.location.href = path
                                      setTimeout(() => {
                                        const element = document.querySelector(`#${hash}`)
                                        if (element) {
                                          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                        }
                                      }, 100)
                                    } else {
                                      handleLinkClick(`#${hashPart}`)
                                    }
                                  }
                                } else {
                                  setIsMenuOpen(false)
                                }
                              }
                            }}
                            className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-base sm:text-lg text-white/80 hover:bg-white/10 hover:text-[#00D4FF] transition-all duration-200 active:bg-white/5"
                          >
                            {sub.icon && <sub.icon className="w-4 h-4 flex-shrink-0" />}
                            <span>{sub.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {/* Divider */}
                <div className="my-6 sm:my-8 border-t border-white/10" />

                {/* Mobile Menu Actions */}
                <div className="space-y-3">
                  {!isConnected && (
                    <div className="w-full px-4">
                      <appkit-button />
                    </div>
                  )}
                  {isConnected && (
                    <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                      <div className="text-xs text-white/60 mb-1">Connected Wallet</div>
                      <div className="text-sm font-mono text-white break-all">
                        {address?.slice(0, 8)}...{address?.slice(-6)}
                      </div>
                      <motion.button
                        onClick={() => {
                          disconnect()
                          setIsMenuOpen(false)
                        }}
                        className="mt-3 w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-white font-bold text-sm transition-all"
                        whileTap={{ scale: 0.95 }}
                      >
                        Disconnect
                      </motion.button>
                    </div>
                  )}
                  {isGigStreamPage ? (
                    <Link href="/gigstream/post" onClick={() => setIsMenuOpen(false)} className="block px-4">
                      <motion.button
                        className="w-full px-6 py-3.5 bg-gradient-to-r from-[#00D4FF] to-[#7B00FF] rounded-xl text-white font-bold flex items-center justify-center space-x-2 text-base shadow-neural-glow"
                        whileTap={{ scale: 0.95 }}
                      >
                        <Plus className="w-5 h-5" />
                        <span>Post Job</span>
                      </motion.button>
                    </Link>
                  ) : (
                    <Link href="/gigstream" onClick={() => setIsMenuOpen(false)} className="block px-4">
                      <motion.button
                        className="w-full px-6 py-3.5 bg-gradient-to-r from-[#00D4FF] to-[#7B00FF] rounded-xl text-white font-bold text-base shadow-neural-glow"
                        whileTap={{ scale: 0.95 }}
                      >
                        Get Started
                      </motion.button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

