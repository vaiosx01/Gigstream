'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle, Send, Mic, X, Bot, Download, Search,
  Menu, ChevronUp, ChevronDown
} from 'lucide-react'
import { useGemini } from '@/providers/GeminiProvider'
import { useAccount } from 'wagmi'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

// MESSAGE INTERFACE
interface Message {
  id: string
  role: 'user' | 'bot'
  content: string
  timestamp: Date
  model?: string
  status?: 'pending' | 'delivered' | 'error'
}

export default function GeminiBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [voiceActive, setVoiceActive] = useState(false)
  const [historyCollapsed, setHistoryCollapsed] = useState(true)

  const { address, isConnected } = useAccount()
  const { generateText } = useGemini()
  const { showToast } = useToast()
  const bottomRef = useRef<HTMLDivElement>(null)

  // RESPONSIVE DETECTION
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // SCROLL TO BOTTOM
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [messages, isOpen])

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      status: 'delivered'
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    const botMessageId = (Date.now() + 1).toString()
    const botMessage: Message = {
      id: botMessageId,
      role: 'bot',
      content: '',
      timestamp: new Date(),
      status: 'pending',
      model: 'gemini'
    }

    setMessages(prev => [...prev, botMessage])

    try {
      const response = await generateText(userMessage.content)
      
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId 
          ? { ...msg, content: response, status: 'delivered', model: 'gemini' }
          : msg
      ))
    } catch (error: any) {
      const errorMessage = error?.message || 'Error temporal. Por favor intenta de nuevo.'
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId 
          ? { ...msg, content: errorMessage, status: 'error' }
          : msg
      ))
      showToast({ 
        title: 'Error', 
        description: errorMessage.includes('no está configurado') 
          ? 'Gemini AI no está configurado en producción'
          : 'No se pudo conectar con Gemini AI'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // VOICE INPUT (Web Speech API)
  const startVoice = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showToast({ title: 'Voice not supported', description: 'Use keyboard to type' })
      return
    }

    setVoiceActive(true)
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'es-MX'
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('')
      setInput(transcript)
    }

    recognition.onerror = () => {
      setVoiceActive(false)
      showToast({ title: 'Voice error', description: 'Could not recognize audio' })
    }

    recognition.onend = () => {
      setVoiceActive(false)
    }

    recognition.start()
  }

  // RESPONSIVE SIZES
  const orbSize = isMobile ? 'w-10 h-10' : 'w-12 h-12'
  const chatWidth = isMobile
    ? 'w-[75vw] max-w-xs h-[50vh] max-h-[65vh]'
    : 'w-[320px] h-[400px] lg:w-[360px] lg:h-[450px] xl:w-[380px] xl:h-[480px]'

  return (
    <>
      {/* RESPONSIVE FLOATING ORB */}
      <motion.div
        className={cn(
          'fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-3',
          isMobile && 'bottom-3 right-3'
        )}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* MAIN ORB BUTTON */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            orbSize,
            'bg-gradient-to-br from-somnia-purple via-mx-green to-somnia-cyan',
            'rounded-3xl shadow-2xl shadow-somnia-purple/50 backdrop-blur-xl border-4 border-white/20',
            'flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 group',
            'hover:shadow-neural-glow-lg'
          )}
          whileHover={{ y: -8 }}
          whileTap={{ scale: 0.95 }}
                    aria-label="Open chatbot"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6 text-white drop-shadow-2xl" />
          </motion.div>

          {/* NOTIFICATION BADGE */}
          {messages.length > 0 && !isOpen && (
            <motion.div 
              className="absolute -top-1 -right-1 w-6 h-6 bg-mx-green rounded-full flex items-center justify-center text-xs font-black border-2 border-white shadow-lg text-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              {Math.min(messages.length, 9)}
            </motion.div>
          )}
        </motion.button>

        {/* VOICE BUTTON (DESKTOP ONLY) */}
        {!isMobile && !isOpen && (
          <motion.button
            onClick={startVoice}
            className="w-12 h-12 bg-gradient-to-r from-somnia-cyan to-somnia-purple/80 rounded-2xl backdrop-blur-xl border border-white/20 shadow-neural-glow hover:shadow-neural-glow-lg flex items-center justify-center hover:scale-110 transition-all"
            whileHover={{ rotate: 10 }}
                    aria-label="Start voice recognition"
          >
            <Mic className={cn(
              'w-5 h-5 text-white',
              voiceActive && 'text-mx-green animate-pulse'
            )} />
          </motion.button>
        )}
      </motion.div>

      {/* RESPONSIVE CHAT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed z-50 backdrop-blur-3xl shadow-2xl shadow-black/50 border border-white/20 rounded-xl overflow-hidden',
              chatWidth,
              isMobile 
                ? 'bottom-16 right-2' 
                : 'bottom-16 right-3'
            )}
          >
            {/* HEADER RESPONSIVO */}
            <div className="p-2 lg:p-2.5 border-b border-white/10 bg-gradient-to-r from-somnia-purple/30 via-mx-green/10 to-somnia-cyan/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                  <motion.div 
                    className="w-6 h-6 lg:w-7 lg:h-7 bg-gradient-to-br from-somnia-purple to-mx-green rounded-lg flex items-center justify-center shadow-xl shadow-somnia-purple/50 flex-shrink-0"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Bot className="w-4 h-4 lg:w-4 lg:h-4 text-white" />
                  </motion.div>
                  
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-xs lg:text-sm truncate bg-gradient-to-r from-white to-somnia-purple/80 bg-clip-text text-transparent">
                      GigStream AI
                    </h3>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <div className="w-1 h-1 bg-mx-green rounded-full animate-pulse flex-shrink-0" />
                      <span className="text-[9px] lg:text-[10px] text-white/60 font-mono uppercase tracking-wider truncate">
                        Gemini AI
                      </span>
                      {isLoading && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                          className="w-2 h-2 border border-somnia-cyan border-t-transparent rounded-full ml-1"
                        />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  {/* HISTORY COLLAPSE */}
                  <motion.button
                    onClick={() => setHistoryCollapsed(!historyCollapsed)}
                    className="p-1.5 rounded-lg backdrop-blur-sm hover:bg-white/10 transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="View history"
                    aria-label="Toggle history"
                  >
                    {historyCollapsed ? <Menu className="w-4 h-4 text-white" /> : <ChevronUp className="w-4 h-4 text-white" />}
                  </motion.button>
                  
                  {/* CLOSE */}
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-white/10 rounded-lg backdrop-blur-sm transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Close chatbot"
                  >
                    <X className="w-4 h-4 text-white/80" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* MESSAGES CONTAINER RESPONSIVO */}
            <div className="flex-1 p-2 lg:p-2.5 overflow-y-auto max-h-[220px] lg:max-h-[300px] scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {/* HISTORY COLLAPSED */}
              {!historyCollapsed && messages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-2 p-2 bg-white/5 backdrop-blur-xl rounded-lg border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-mono text-[10px] uppercase text-white/60 tracking-wider flex items-center space-x-1.5">
                      <Search className="w-3 h-3" />
                      <span>History ({messages.length})</span>
                    </h4>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(messages, null, 2))
                        showToast({ title: 'Copied', description: 'History copied to clipboard' })
                      }}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      aria-label="Export history"
                    >
                      <Download className="w-3 h-3 text-white/60" />
                    </button>
                  </div>
                  <div className="max-h-20 overflow-y-auto space-y-1 scrollbar-thin">
                    {messages.slice(-5).reverse().map((msg) => (
                      <div key={msg.id} className="text-[9px] text-white/50 truncate pr-2">
                        {msg.role === 'user' ? '👤' : '🤖'} {msg.content.slice(0, 30)}...
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* MESSAGES */}
              {messages.map((message, idx) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    'flex mb-4',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div className={cn(
                    'max-w-[85%] lg:max-w-[75%] p-2 rounded-xl backdrop-blur-xl shadow-md shadow-black/30 border border-white/20',
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-mx-green/90 to-somnia-purple/90 text-white'
                      : 'bg-white/10 text-white',
                    message.status === 'error' && 'border-red-500/50 bg-red-500/10'
                  )}>
                    {/* CONTENT */}
                    <p className="text-[11px] lg:text-xs whitespace-pre-wrap leading-relaxed">
                      {message.content || (message.status === 'pending' && (
                        <span className="flex items-center space-x-1">
                          <span className="animate-neural-typing">●</span>
                          <span className="animate-neural-typing" style={{animationDelay: '0.2s'}}>●</span>
                          <span className="animate-neural-typing" style={{animationDelay: '0.4s'}}>●</span>
                        </span>
                      ))}
                    </p>
                    
                    {/* STATUS & MODEL */}
                    <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-white/20 text-[9px]">
                      <span className="font-mono text-white/60">
                        {message.timestamp.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      
                      {message.status === 'pending' && (
                        <div className="flex items-center space-x-0.5">
                          <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                          <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                          <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                        </div>
                      )}
                      
                      {message.status === 'error' && (
                        <span className="text-red-400 font-mono text-[9px]">Error</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* EMPTY STATE */}
              {messages.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center h-24 lg:h-32 text-center text-white/50">
                  <Bot className="w-8 h-8 lg:w-10 lg:h-10 mb-2 opacity-40 animate-pulse" />
                  <h3 className="text-xs lg:text-sm font-semibold mb-1 text-white/80">GigStream AI</h3>
                  <p className="text-[10px] lg:text-xs max-w-xs mb-2">Ask about jobs, bids or Somnia SDS</p>
                  <div className="mt-1 text-[9px] lg:text-[10px] font-mono space-y-0.5 text-white/40">
                    <div>- &quot;Jobs plumber CDMX&quot;</div>
                    <div>- &quot;Optimize my bid&quot;</div>
                    <div>- &quot;In-demand skills&quot;</div>
                  </div>
                </div>
              )}

              {/* BOTTOM REF */}
              <div ref={bottomRef} />
            </div>

            {/* INPUT RESPONSIVO */}
            <div className="p-2 lg:p-2.5 border-t border-white/10 bg-white/5">
              <div className="flex items-end space-x-1.5">
                {/* TEXT INPUT */}
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      if (input.trim()) sendMessage()
                    }
                  }}
                  placeholder="Type..."
                  className={cn(
                    'flex-1 max-h-12 bg-white/10 border border-white/20',
                    'rounded-lg px-2.5 py-1.5 text-white placeholder-white/50',
                    'backdrop-blur-xl focus:outline-none focus:border-somnia-purple/50',
                    'focus:ring-1 focus:ring-somnia-purple/20 focus:ring-offset-0',
                    'transition-all duration-300 text-[11px] lg:text-xs',
                    input && 'ring-1 ring-somnia-purple/30'
                  )}
                  maxLength={2000}
                  disabled={isLoading}
                />
                
                {/* SEND BUTTON */}
                <motion.button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    'w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center flex-shrink-0',
                    'bg-gradient-to-r from-somnia-purple via-mx-green to-somnia-cyan',
                    'rounded-lg shadow-lg shadow-somnia-purple/40',
                    'hover:shadow-neural-glow border border-white/20 backdrop-blur-3xl',
                    'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none',
                    'transition-all duration-300 group'
                  )}
                  whileHover={{ scale: isLoading ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Send message"
                >
                  <Send className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
                </motion.button>
              </div>
              
              {/* CHAR COUNTER */}
              <div className="flex items-center justify-between mt-1 text-[9px] text-white/40 font-mono">
                <span>{input.length}/2000</span>
                {isLoading && (
                  <span className="flex items-center space-x-0.5">
                    <div className="w-1 h-1 bg-white/40 rounded-full animate-ping" />
                    <span>Sending...</span>
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

