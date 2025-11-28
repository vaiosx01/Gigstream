'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, DollarSign, Zap, Sparkles, Brain, CheckCircle2 } from 'lucide-react'
import { useGemini } from '@/providers/GeminiProvider'

export default function AIBidOptimizer() {
  const [currentBid, setCurrentBid] = useState('500')
  const [jobReward, setJobReward] = useState('800')
  const [optimization, setOptimization] = useState<any>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [modelUsed, setModelUsed] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { generateText } = useGemini()

  const optimizeBid = async () => {
    setIsOptimizing(true)
    setError(null)
    setModelUsed(null)
    
    try {
      const prompt = `
        You are an expert in bid optimization for freelance marketplace Mexico.
        Job reward: ${jobReward} STT
        Current bid: ${currentBid} STT
        Average competition: ${parseInt(jobReward) * 0.7} STT
        
        Generate valid JSON with this exact structure:
        {
          "optimalBid": number,
          "savings": number,
          "winProbability": number between 0 and 100,
          "strategy": "text without internal quotes or line breaks",
          "tips": ["text1", "text2", "text3"]
        }
        
        IMPORTANT:
        - Respond ONLY with JSON, no markdown, no explanations, no code
        - Use double quotes for all strings
        - Escape any quotes inside strings with \\"
        - Do not use line breaks inside text strings
        - Numbers must be integers without quotes
      `
      
      const response = await generateText(prompt)
      
      // Robust JSON extraction and parsing with multiple fallback strategies
      let cleaned = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      // Try to extract JSON object
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        cleaned = jsonMatch[0]
      }
      
      // Fix common JSON issues
      // 1. Remove trailing commas before closing braces/brackets
      cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1')
      
      // 2. Fix single quotes to double quotes (for JSON keys and string values)
      cleaned = cleaned.replace(/'/g, '"')
      
      // 3. Fix unescaped newlines in strings
      cleaned = cleaned.replace(/"([^"]*)\n([^"]*)"/g, '"$1\\n$2"')
      
      let opt
      try {
        opt = JSON.parse(cleaned)
      } catch (parseError: any) {
        console.warn('JSON parse failed, attempting manual extraction:', parseError.message)
        console.warn('Cleaned response:', cleaned.substring(0, 500))
        
        // If parsing still fails, try to extract values manually
        // Extract numeric values with multiple patterns
        const optimalBidMatch = cleaned.match(/"optimalBid"\s*:\s*(\d+)/i) || 
                                cleaned.match(/optimalBid["\s:]*(\d+)/i) ||
                                cleaned.match(/optimal[^:]*bid[^:]*:\s*(\d+)/i)
        
        const savingsMatch = cleaned.match(/"savings"\s*:\s*(-?\d+)/i) || 
                            cleaned.match(/savings["\s:]*(-?\d+)/i) ||
                            cleaned.match(/ahorro[^:]*:\s*(-?\d+)/i)
        
        const winProbMatch = cleaned.match(/"winProbability"\s*:\s*(\d+)/i) || 
                            cleaned.match(/winProbability["\s:]*(\d+)/i) ||
                            cleaned.match(/probabilidad[^:]*:\s*(\d+)/i)
        
        // Extract strategy text (between quotes or after colon)
        const strategyMatch = cleaned.match(/"strategy"\s*:\s*"([^"]{0,200})"/i) || 
                             cleaned.match(/strategy["\s:]*["']?([^"'\n}]{0,200})["']?/i) ||
                             cleaned.match(/estrategia[^:]*:\s*["']?([^"'\n}]{0,200})["']?/i)
        
        // Extract tips array with better handling
        let tips: string[] = []
        const tipsMatch = cleaned.match(/"tips"\s*:\s*\[([^\]]+)\]/is) || 
                         cleaned.match(/tips["\s:]*\[([^\]]+)\]/is)
        
        if (tipsMatch) {
          // Try to parse as JSON array first
          try {
            const tipsArray = JSON.parse(`[${tipsMatch[1]}]`)
            tips = Array.isArray(tipsArray) ? tipsArray.map((t: any) => String(t).trim()) : []
          } catch {
            // Fallback: split by comma and clean
            tips = tipsMatch[1]
              .split(',')
              .map((t: string) => t.trim().replace(/^["'\s]+|["'\s]+$/g, ''))
              .filter((t: string) => t.length > 0)
          }
        }
        
        // Default tips if extraction failed
        if (tips.length === 0) {
          tips = [
            'Bid 10-15% below average to increase chances',
            'Respond quickly to stand out',
            'Highlight relevant specific skills'
          ]
        }
        
        const optimalBid = optimalBidMatch ? parseInt(optimalBidMatch[1]) : Math.floor(parseInt(jobReward) * 0.65)
        const currentBidNum = parseInt(currentBid) || 0
        
        opt = {
          optimalBid,
          savings: savingsMatch ? parseInt(savingsMatch[1]) : (currentBidNum - optimalBid),
          winProbability: winProbMatch ? parseInt(winProbMatch[1]) : 75,
          strategy: strategyMatch ? strategyMatch[1].trim() : 'Competitive bid based on market analysis',
          tips
        }
      }
      
      setOptimization(opt)
      setModelUsed('gemini-2.5-flash') // Could be enhanced to get actual model from API
    } catch (error: any) {
      console.error('Error optimizing bid:', error)
      const errorMessage = error?.message || 'Error al optimizar la oferta. Por favor intenta de nuevo.'
      
      // Check if it's a configuration error
      if (errorMessage.includes('no está configurado') || errorMessage.includes('not configured')) {
        setError('Gemini AI no está configurado. Usando valores por defecto.')
      } else {
        setError(errorMessage)
      }
      
      // Fallback optimization
      const optimal = Math.floor(parseInt(jobReward) * 0.65)
      setOptimization({
        optimalBid: optimal,
        savings: parseInt(currentBid) - optimal,
        winProbability: 78,
        strategy: 'Oferta competitiva pero rentable (valores por defecto)',
        tips: [
          'Oferta 10-15% por debajo del promedio para aumentar oportunidades',
          'Responde rápidamente para destacar',
          'Destaca habilidades específicas relevantes'
        ]
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-xl bg-gradient-to-br from-mx-green/20 to-somnia-purple/20 rounded-3xl border border-mx-green/30 p-4 md:p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-mx-green to-somnia-purple rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>AI Bid Optimizer</span>
              <span className="text-xs bg-gradient-to-r from-somnia-cyan to-mx-green px-2 py-0.5 rounded-full font-mono text-white/90">
                Gemini
              </span>
            </h3>
            <p className="text-white/60 text-xs">Intelligent optimization with Google Gemini AI</p>
          </div>
        </div>
        {modelUsed && (
          <div className="flex items-center space-x-1 text-xs text-white/50">
            <CheckCircle2 className="w-3 h-3 text-mx-green" />
            <span className="font-mono">{modelUsed}</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-white/70 text-sm mb-2 block">Job Reward (STT)</label>
          <input
            type="number"
            value={jobReward}
            onChange={(e) => setJobReward(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white font-mono"
          />
        </div>
        <div>
          <label className="text-white/70 text-sm mb-2 block">Your Current Bid (STT)</label>
          <input
            type="number"
            value={currentBid}
            onChange={(e) => setCurrentBid(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white font-mono"
          />
        </div>

        <motion.button
          onClick={optimizeBid}
          disabled={isOptimizing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full px-4 py-3 bg-gradient-to-r from-somnia-cyan to-somnia-purple rounded-xl text-white font-bold disabled:opacity-50 flex items-center justify-center space-x-2 relative overflow-hidden"
        >
          {isOptimizing && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )}
          {isOptimizing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <Brain className="w-4 h-4" />
              </motion.div>
              <span>Gemini analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Optimize with Gemini AI</span>
            </>
          )}
        </motion.button>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm"
          >
            {error}
          </motion.div>
        )}

        {optimization && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-4 p-4 bg-gradient-to-br from-white/10 to-somnia-purple/10 rounded-xl border border-somnia-cyan/30 shadow-neural-glow"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-somnia-cyan" />
                <span className="text-xs font-mono text-white/70">Gemini AI Analysis</span>
              </div>
              {modelUsed && (
                <span className="text-xs text-white/50 font-mono">{modelUsed}</span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-white/60 text-xs mb-1">Optimal Bid</div>
                <div className="text-2xl font-black text-mx-green">{optimization.optimalBid} STT</div>
              </div>
              <div>
                <div className="text-white/60 text-xs mb-1">Probability</div>
                <div className="text-2xl font-black text-somnia-cyan">{optimization.winProbability}%</div>
              </div>
            </div>
            {optimization.savings > 0 && (
              <div className="p-3 bg-mx-green/20 rounded-lg border border-mx-green/30">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-mx-green" />
                  <span className="text-white font-bold">Savings: {optimization.savings} STT</span>
                </div>
              </div>
            )}
            <div>
              <div className="text-white/70 text-sm mb-2">Strategy:</div>
              <p className="text-white text-sm">{optimization.strategy}</p>
            </div>
            <div>
              <div className="text-white/70 text-sm mb-2 flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Tips:</span>
              </div>
              <ul className="space-y-1">
                {optimization.tips?.map((tip: string, idx: number) => (
                  <li key={idx} className="text-white/80 text-sm flex items-start space-x-2">
                    <span className="text-mx-green">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

