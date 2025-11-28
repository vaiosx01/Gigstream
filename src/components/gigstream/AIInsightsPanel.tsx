'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, TrendingUp, Target, Zap, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { useGemini } from '@/providers/GeminiProvider'
import { useGigStream } from '@/hooks/useGigStream'
import { useAccount } from 'wagmi'

export default function AIInsightsPanel() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [insights, setInsights] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [modelUsed, setModelUsed] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { generateText } = useGemini()
  const { reputation, userJobIds, workerJobIds } = useGigStream()
  const { address } = useAccount()

  useEffect(() => {
    if (address && reputation) {
      loadInsights()
    }
  }, [address, reputation])

  // Don't retry if API key is not configured
  const shouldRetry = (error: any) => {
    return !error?.message?.includes('API key') && !error?.message?.includes('not configured')
  }

  const loadInsights = async () => {
    setIsLoading(true)
    setError(null)
    setModelUsed(null)
    
    try {
      const prompt = `
        You are an expert in freelance market analysis Mexico. 
        User: ${address?.slice(0, 6)}...${address?.slice(-4)}
        Reputation: ${reputation.reputationScore}
        Jobs completed: ${reputation.jobsCompleted}
        Jobs posted: ${userJobIds.length}
        Jobs worked: ${workerJobIds.length}
        
        Generate valid analysis JSON with:
        {
          "marketTrends": ["trend 1", "trend 2", "trend 3"],
          "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
          "skillDemand": ["skill 1", "skill 2", "skill 3"],
          "optimizationTips": ["tip 1", "tip 2", "tip 3"]
        }
        
        Respond ONLY with valid JSON, no markdown or explanations.
      `
      
      const response = await generateText(prompt)
      setModelUsed('gemini-2.5-flash')
      
      try {
        // Try to parse as JSON
        let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          cleaned = jsonMatch[0]
        }
        const parsed = JSON.parse(cleaned)
        setInsights(parsed)
      } catch {
        // If not JSON, create structured object from text
        const lines = response.split('\n').filter((l: string) => l.trim())
        setInsights({
          marketTrends: lines.slice(0, 3).map((l: string) => l.replace(/^[-•]\s*/, '')),
          recommendations: lines.slice(3, 6).map((l: string) => l.replace(/^[-•]\s*/, '')),
          skillDemand: ['Plumber', 'Electrician', 'Events'],
          optimizationTips: lines.slice(6, 9).map((l: string) => l.replace(/^[-•]\s*/, '')) || [
            'Bid 10-15% below average for competitive jobs',
            'Respond within 5 minutes to increase acceptance',
            'Highlight specific skills in your bid'
          ]
        })
      }
    } catch (error: any) {
      // Only log if it's not a configuration error
      const isConfigError = error?.message?.includes('API key') || error?.message?.includes('not configured')
      if (!isConfigError) {
        console.error('Error loading insights:', error)
      }
      
      // Set user-friendly error message
      if (isConfigError) {
        setError('Gemini AI is not configured. Showing fallback insights.')
      } else {
        setError(error?.message || 'Failed to load insights. Showing fallback data.')
      }
      
      // Fallback insights
      setInsights({
        marketTrends: [
          'High demand for plumbers in CDMX (+23% this month)',
          'Corporate events increasing in Guadalajara',
          'Electrical services with better average pay'
        ],
        recommendations: [
          'Focus on plumbing jobs in Polanco/Roma',
          'Improve your response time for more acceptances',
          'Consider expanding your skill range'
        ],
        skillDemand: ['Plumber', 'Electrician', 'Events'],
        optimizationTips: [
          'Bid 10-15% below average for competitive jobs',
          'Respond within 5 minutes',
          'Highlight specific skills in your bid'
        ]
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-xl bg-gradient-to-br from-somnia-purple/20 via-somnia-cyan/10 to-mx-green/20 rounded-3xl border border-somnia-cyan/30 shadow-neural-glow overflow-hidden w-full"
    >
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-somnia-cyan to-somnia-purple rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <span>AI Insights</span>
                <span className="text-xs bg-gradient-to-r from-somnia-cyan to-mx-green px-2 py-1 rounded-full font-mono text-white/90">
                  Gemini AI
                </span>
              </h3>
              <div className="flex items-center space-x-2">
                <p className="text-white/60 text-sm">Personalized intelligent analysis</p>
                {modelUsed && (
                  <span className="text-xs text-white/40 font-mono">• {modelUsed}</span>
                )}
              </div>
            </div>
          </div>
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-white/70" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white/70" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="p-4 md:p-6 space-y-4 md:space-y-6"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-8 h-8 border-4 border-somnia-cyan border-t-transparent rounded-full"
                />
                <span className="text-white/70 font-mono">Gemini generating insights...</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-white/50">
                <Brain className="w-4 h-4" />
                <span className="font-mono">Processing with AI...</span>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          ) : insights ? (
            <>
              {/* Market Trends */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-somnia-cyan" />
                  <h4 className="font-bold text-white">Market Trends</h4>
                </div>
                <div className="space-y-2">
                  {insights.marketTrends?.map((trend: string, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-3 bg-white/5 rounded-xl border border-white/10"
                    >
                      <p className="text-white/80 text-sm">{trend}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Target className="w-5 h-5 text-mx-green" />
                  <h4 className="font-bold text-white">Recommendations</h4>
                </div>
                <div className="space-y-2">
                  {insights.recommendations?.map((rec: string, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-3 bg-gradient-to-r from-mx-green/10 to-somnia-purple/10 rounded-xl border border-mx-green/20"
                    >
                      <p className="text-white/80 text-sm">{rec}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Skill Demand */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Zap className="w-5 h-5 text-scroll-gold" />
                  <h4 className="font-bold text-white">In-Demand Skills</h4>
                </div>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {insights.skillDemand?.map((skill: string, idx: number) => (
                    <motion.span
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="px-4 py-2 bg-gradient-to-r from-scroll-gold/20 to-mx-green/20 border border-scroll-gold/30 rounded-full text-white font-medium text-sm"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Optimization Tips */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="w-5 h-5 text-somnia-purple" />
                  <h4 className="font-bold text-white">Optimization Tips</h4>
                </div>
                <div className="space-y-2">
                  {insights.optimizationTips?.map((tip: string, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-start space-x-2"
                    >
                      <span className="text-somnia-cyan font-bold">{idx + 1}.</span>
                      <p className="text-white/80 text-sm flex-1">{tip}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-white/60">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p>Connect your wallet to see personalized insights</p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

