// src/app/gigstream/post/page.tsx - Post Job + Gemini IA Suggestions
'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { MapPin, DollarSign, Clock, Send, Bot, Zap } from 'lucide-react'
import { useAccount, useSendTransaction, useBalance } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { useGemini } from '@/providers/GeminiProvider'
import { useToast } from '@/components/ui/use-toast'
import { useGigStream } from '@/hooks/useGigStream'
import { useTransactionNotification } from '@/hooks/useTransactionNotification'
import Navbar from '@/components/somnia/Navbar'
import Footer from '@/components/somnia/Footer'
import LocationSelector from '@/components/gigstream/LocationSelector'

export default function PostJob() {
  const [isPending, startTransition] = useTransition()
  const { address, isConnected } = useAccount()
  const { sendTransactionAsync } = useSendTransaction()
  const { generateText } = useGemini()
  const { showToast } = useToast()
  const { jobCounter } = useGigStream()
  const { showSuccess, showError, showPending, NotificationComponents } = useTransactionNotification()
  
  // Check user balance
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address: address,
    query: {
      enabled: isConnected && !!address,
    },
  })

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    description: '',
    reward: '',
    deadline: '',
    lat: '',
    lng: ''
  })
  const [geminiSuggestions, setGeminiSuggestions] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const generateSuggestions = async () => {
    setIsGenerating(true)
    setGeminiSuggestions([])
    try {
      const suggestions = await generateText(`
        You are a freelance expert in global freelance markets. User location: ${formData.location}
        Skills in demand: plumber, electrician, DJ events, production crew, handyman, technician
        
        Suggest 3 job titles + reward ranges for: "${formData.title || 'service'}" in ${formData.location}
        Respond ONLY with a valid JSON array: ["Emergency Plumber (300-800 STT)", "Electrician (450-1100 STT)", "DJ Corporate Event (600-1500 STT)"]
        No markdown, no explanations, just the JSON array.
      `)
      
      // Robust JSON extraction and parsing
      let cleaned = suggestions
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      // Extract JSON array
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        cleaned = jsonMatch[0]
      }
      
      // Fix common JSON issues
      // Remove trailing commas before closing brackets
      cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1')
      
      // Fix single quotes to double quotes
      cleaned = cleaned.replace(/'/g, '"')
      
      // Fix unescaped newlines in strings
      cleaned = cleaned.replace(/"([^"]*)\n([^"]*)"/g, '"$1\\n$2"')
      
      let parsed: string[] = []
      
      try {
        parsed = JSON.parse(cleaned) as string[]
        
        // Validate it's an array of strings
        if (!Array.isArray(parsed)) {
          throw new Error('Response is not an array')
        }
        
        // Filter and clean suggestions
        parsed = parsed
          .filter((item: any) => typeof item === 'string' && item.trim().length > 0)
          .map((item: string) => item.trim())
          .slice(0, 3) // Limit to 3 suggestions
        
      } catch (parseError) {
        console.warn('JSON parse failed, attempting manual extraction:', parseError)
        
        // Manual extraction fallback - look for strings in quotes
        const stringMatches = cleaned.match(/"([^"]{10,100})"/g)
        if (stringMatches && stringMatches.length > 0) {
          parsed = stringMatches
            .map((match: string) => match.replace(/^"|"$/g, ''))
            .filter((s: string) => s.trim().length > 0)
            .slice(0, 3)
        } else {
          // Last resort: split by lines and filter
          const lines = cleaned
            .split('\n')
            .map((line: string) => line.trim())
            .filter((line: string) => {
              // Filter out markdown, brackets, and very short lines
              return line.length > 10 && 
                     !line.startsWith('```') && 
                     line !== '[' && 
                     line !== ']' &&
                     !line.match(/^[\[\]{},"\s]*$/)
            })
            .slice(0, 3)
          
          parsed = lines
        }
      }
      
      if (parsed.length > 0) {
        setGeminiSuggestions(parsed)
      } else {
        showToast({ 
          title: "No suggestions", 
          description: "Could not parse AI suggestions. Try again." 
        })
      }
    } catch (error) {
      console.error('Error generating suggestions:', error)
      showToast({ 
        title: "AI Error", 
        description: "Could not generate suggestions. Please try again." 
      })
    }
    setIsGenerating(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate wallet connection
    if (!isConnected || !address) {
      showToast({ 
        title: "Wallet not connected", 
        description: "Please connect your wallet to post a job" 
      })
      return
    }

    // Validate form data
    if (!formData.title || !formData.location || !formData.reward || !formData.deadline) {
      showToast({ 
        title: "Missing information", 
        description: "Please fill in all required fields" 
      })
      return
    }

    // Validate deadline
    const deadlineDate = new Date(formData.deadline)
    const now = new Date()
    if (deadlineDate <= now) {
      showToast({ 
        title: "Invalid deadline", 
        description: "Deadline must be in the future" 
      })
      return
    }

    // Validate reward amount
    const rewardAmount = parseEther(formData.reward)
    if (rewardAmount <= 0n) {
      showToast({ 
        title: "Invalid reward", 
        description: "Reward must be greater than 0" 
      })
      return
    }

    // Check balance
    if (balance && balance.value < rewardAmount) {
      const balanceFormatted = formatEther(balance.value)
      showToast({ 
        title: "Insufficient balance", 
        description: `You need ${formData.reward} STT but only have ${balanceFormatted} STT` 
      })
      return
    }

    startTransition(async () => {
      try {
        const { GIGESCROW_ADDRESS } = await import('@/lib/contracts')
        // Ensure address is properly formatted (trim and validate)
        const contractAddress = GIGESCROW_ADDRESS.trim() as `0x${string}`
        if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
          showError(
            "Contract Error",
            "Contract not deployed. Configure NEXT_PUBLIC_GIGESCROW_ADDRESS"
          )
          return
        }
        
        // Validate address format
        if (!contractAddress.startsWith('0x') || contractAddress.length !== 42) {
          showError(
            "Invalid Contract",
            "Invalid contract address format"
          )
          return
        }

        // Convert deadline to timestamp
        const deadlineTimestamp = Math.floor(new Date(formData.deadline).getTime() / 1000)
        
        // Validate deadline is at least 1 day in the future (contract requirement)
        const minDeadline = Math.floor(Date.now() / 1000) + 86400 // 1 day
        if (deadlineTimestamp < minDeadline) {
          showError(
            "Invalid Deadline",
            "Deadline must be at least 1 day from now"
          )
          return
        }
        
        // Encode function call using viem
        const { encodeFunctionData } = await import('viem')
        const { gigEscrowAbi } = await import('@/lib/viem')
        
        const data = encodeFunctionData({
          abi: gigEscrowAbi,
          functionName: 'postJob',
          args: [
            formData.title,
            formData.location,
            rewardAmount,
            BigInt(deadlineTimestamp)
          ]
        })

        // Show pending notification
        showPending(
          "Posting Job...",
          "Please confirm the transaction in your wallet"
        )

        const hash = await sendTransactionAsync({
          to: contractAddress,
          value: rewardAmount,
          data: data as `0x${string}`,
        })

        // Show success notification with transaction hash
        showSuccess(
          "Job Posted Successfully!",
          "Your job has been posted to the blockchain and will appear in the marketplace shortly.",
          hash as string,
          6000
        )

        // Note: Job will be automatically published to Somnia Data Streams
        // via the /api/streams endpoint when it detects the JobPosted event
        // This happens in the background and enriches the data with structured streams

        // Redirect to dashboard after successful post
        setTimeout(() => {
          window.location.href = '/gigstream'
        }, 3000)
      } catch (error: any) {
        console.error('Error posting job:', error)
        
        // Extract transaction hash if available
        const txHash = error?.transactionHash || error?.hash || error?.data?.hash
        
        // Provide user-friendly error messages
        let errorTitle = "Transaction Failed"
        let errorMessage = "Failed to post job"
        
        if (error?.message?.includes('User rejected')) {
          errorTitle = "Transaction Cancelled"
          errorMessage = "You cancelled the transaction in your wallet"
        } else if (error?.message?.includes('insufficient funds') || error?.message?.includes('balance')) {
          errorTitle = "Insufficient Balance"
          errorMessage = "You don't have enough STT. Please check your balance and try again."
        } else if (error?.message?.includes('Internal JSON-RPC error')) {
          errorTitle = "Network Error"
          errorMessage = "Network connection error. Please check your connection and try again."
        } else if (error?.message) {
          errorMessage = error.message
        }
        
        showError(
          errorTitle,
          errorMessage,
          txHash,
          10000
        )
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-blue via-somnia-purple/20 to-mx-green/10">
      {NotificationComponents}
      <Navbar />
      <main className="pt-20 pb-16">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-2xl mx-auto space-y-4 sm:space-y-6 md:space-y-8 p-4 sm:p-6 md:p-8"
        >
      {/* Header */}
      <motion.div 
        className="backdrop-blur-xl bg-gradient-to-r from-somnia-purple/20 to-mx-green/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-somnia-purple/30 shadow-neural-glow"
        initial={{ y: 20, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
      >
        <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
          <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-somnia-purple shadow-neural-glow flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-white to-somnia-purple bg-clip-text text-transparent">
              Post Job
            </h1>
            <p className="text-white/70 text-sm sm:text-base md:text-lg mt-1 sm:mt-2">Live on SDS streams in <span className="font-mono text-mx-green">2s</span></p>
          </div>
        </div>
        
        {/* Gemini Suggestion Button */}
        <motion.button
          onClick={generateSuggestions}
          disabled={isGenerating}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 sm:space-x-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-somnia-purple/20 to-mx-green/20 hover:from-somnia-purple/30 hover:to-mx-green/30 backdrop-blur-xl border border-somnia-cyan/30 rounded-xl sm:rounded-2xl text-white font-mono text-sm sm:text-base transition-all duration-300 hover:shadow-neural-glow relative overflow-hidden"
          whileHover={{ scale: 1.02 }}
        >
          {isGenerating && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )}
          {isGenerating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.div>
              <span className="text-xs sm:text-sm">Gemini generating...</span>
            </>
          ) : (
            <>
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">Gemini AI Suggestions</span>
              <span className="text-[10px] sm:text-xs bg-gradient-to-r from-somnia-cyan to-mx-green px-1.5 sm:px-2 py-0.5 rounded-full">
                AI
              </span>
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Form */}
      <motion.form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 relative" style={{ zIndex: 1 }}>
        {/* Title */}
        <div className="backdrop-blur-xl bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
          <label className="text-white/80 mb-2 sm:mb-3 font-mono text-xs sm:text-sm uppercase tracking-wide flex items-center space-x-2">
            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Job Title</span>
          </label>
          <input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Emergency Plumber"
            className="w-full bg-white/10 border border-white/20 rounded-lg sm:rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-white placeholder-white/50 backdrop-blur-xl focus:outline-none focus:border-somnia-purple/50 focus:ring-2 focus:ring-somnia-purple/20 text-sm sm:text-base lg:text-lg font-mono transition-all duration-300"
            required
          />
        </div>

        {/* Location + Map */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="backdrop-blur-xl bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 relative" style={{ zIndex: 1 }}>
            <label className="text-white/80 mb-2 sm:mb-3 font-mono text-xs sm:text-sm uppercase tracking-wide flex items-center space-x-2">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Location</span>
            </label>
            <div className="relative" style={{ zIndex: 9999 }}>
              <LocationSelector
                value={formData.location}
                onChange={(location) => setFormData({ ...formData, location })}
                placeholder="Select country and city"
              />
            </div>
          </div>
          
          <div className="backdrop-blur-xl bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
            <label className="text-white/80 mb-2 sm:mb-3 font-mono text-xs sm:text-sm uppercase tracking-wide flex items-center space-x-2">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Deadline</span>
            </label>
            <input
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg sm:rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-white backdrop-blur-xl focus:ring-somnia-purple/20 transition-all duration-300 font-mono text-sm sm:text-base"
              required
            />
          </div>
        </div>

        {/* Reward */}
        <div className="backdrop-blur-xl bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
          <label className="text-white/80 mb-2 sm:mb-3 font-mono text-xs sm:text-sm uppercase tracking-wide flex items-center space-x-2">
            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Reward (STT)</span>
          </label>
          <input
            type="number"
            value={formData.reward}
            onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
            placeholder="500"
            className="w-full bg-gradient-to-r from-mx-green/20 to-somnia-purple/20 border border-mx-green/30 rounded-lg sm:rounded-xl px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 text-lg sm:text-xl md:text-2xl font-black text-mx-green font-mono focus:ring-mx-green/30 text-right"
            required
          />
          <p className="text-[10px] sm:text-xs text-white/50 mt-2 font-mono">
            STT = Shannon Test Token | Gas included | 0% fees
          </p>
        </div>

        {/* Gemini Suggestions */}
        {geminiSuggestions.length > 0 && (
          <motion.div 
            className="backdrop-blur-xl bg-gradient-to-r from-somnia-purple/10 to-mx-green/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-somnia-purple/20 shadow-neural-glow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h4 className="font-bold text-white mb-3 sm:mb-4 flex flex-wrap items-center gap-2 text-sm sm:text-base">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-somnia-cyan" />
              <span>Gemini AI Suggestions</span>
              <span className="text-[10px] sm:text-xs bg-gradient-to-r from-somnia-cyan to-mx-green px-1.5 sm:px-2 py-0.5 rounded-full font-mono">
                Powered by Gemini
              </span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {geminiSuggestions.map((suggestion, idx) => {
                // Clean suggestion text - remove any remaining JSON artifacts
                const cleanSuggestion = suggestion
                  .replace(/^["']|["']$/g, '') // Remove surrounding quotes
                  .replace(/^\[|\]$/g, '') // Remove brackets
                  .trim()
                
                return (
                  <motion.button
                    key={idx}
                    type="button"
                    onClick={() => {
                      // Extract just the job title part (before the STT range if present)
                      const titleOnly = cleanSuggestion.split('(')[0].trim()
                      setFormData(prev => ({ ...prev, title: titleOnly }))
                      setGeminiSuggestions([])
                    }}
                    className="p-3 sm:p-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-lg sm:rounded-xl border border-white/20 text-left transition-all duration-300 hover:scale-105 hover:border-somnia-cyan/50 font-mono text-xs sm:text-sm text-white break-words"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="flex items-start space-x-1.5 sm:space-x-2">
                      <span className="text-somnia-cyan font-bold text-xs sm:text-sm">{idx + 1}.</span>
                      <span className="flex-1 text-xs sm:text-sm">{cleanSuggestion}</span>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={isPending}
          className="w-full bg-gradient-to-r from-somnia-purple via-mx-green to-neural-blue hover:from-somnia-purple/90 p-6 sm:p-8 rounded-2xl sm:rounded-3xl text-lg sm:text-xl lg:text-2xl font-black text-white shadow-2xl shadow-somnia-purple/40 hover:shadow-neural-glow-lg transition-all duration-500 border-2 border-white/30 backdrop-blur-3xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 sm:space-x-4"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Send className="w-5 h-5 sm:w-6 lg:w-8 lg:h-8" />
          <span className="text-sm sm:text-base lg:text-lg xl:text-xl">{isPending ? 'Publishing Live...' : 'Post Job Live SDS'}</span>
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-mx-green rounded-full animate-ping" />
        </motion.button>
      </motion.form>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}

