// src/providers/GeminiProvider.tsx - Gemini 2.5 Flash + Fallbacks
'use client'

import { createContext, useContext, ReactNode, useCallback, useState } from 'react'

const GeminiContext = createContext<any>(null)

const models = [
  'gemini-2.5-flash',    // Primary ✅
  'gemini-2.5-pro',      // Fallback 1 ✅
  'gemini-2.0-flash',    // Fallback 2 ✅
  'gemini-1.5-flash',    // Fallback 3 ✅
  'gemini-1.5-pro'       // Fallback 4 ✅
]

export function GeminiProvider({ children }: { children: ReactNode }) {
  const generateText = useCallback(async (prompt: string, retries = 0): Promise<string> => {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context: 'Mexico freelance marketplace, 56M informal workers'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `API request failed with status ${response.status}`
        
        // Don't retry if API key is not configured (503 status)
        if (response.status === 503 && errorMessage.includes('API key')) {
          throw new Error(errorMessage)
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      // Handle error responses
      if (!data.success) {
        // Don't retry if API key is not configured
        if (data.error?.includes('API key') || data.error?.includes('not configured')) {
          throw new Error(data.error || 'Gemini API key not configured')
        }
        throw new Error(data.error || 'Gemini API error')
      }
      
      // Return text response (provider expects string)
      return data.response || data.text || data.data || ''
    } catch (error: any) {
      // Don't retry on configuration errors (503) or API key errors
      if (error?.message?.includes('API key') || error?.message?.includes('not configured')) {
        throw error
      }
      
      if (retries < models.length - 1) {
        console.warn(`Model ${models[retries]} failed, trying fallback ${retries + 1}`)
        return generateText(prompt, retries + 1)
      }
      throw new Error('All Gemini models failed')
    }
  }, [])

  return (
    <GeminiContext.Provider value={{ generateText }}>
      {children}
    </GeminiContext.Provider>
  )
}

export const useGemini = () => {
  const context = useContext(GeminiContext)
  if (!context) {
    throw new Error('useGemini must be used within GeminiProvider')
  }
  return context
}

