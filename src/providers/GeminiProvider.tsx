// src/providers/GeminiProvider.tsx - Client-side Gemini API Provider
// Note: Model fallback is handled server-side in /api/gemini route
'use client'

import { createContext, useContext, ReactNode, useCallback } from 'react'

const GeminiContext = createContext<any>(null)

export function GeminiProvider({ children }: { children: ReactNode }) {
  const generateText = useCallback(async (prompt: string, context?: string): Promise<string> => {
    try {
      // Use absolute URL in production to avoid CORS issues
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://gigstream-mx.vercel.app'}/api/gemini`
        : '/api/gemini'
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context: context || 'Mexico freelance marketplace, 56M informal workers. Built on Somnia Network L1 blockchain with real-time Data Streams.'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `API request failed with status ${response.status}`
        
        // Don't retry if API key is not configured (503 status)
        if (response.status === 503 && errorMessage.includes('API key')) {
          throw new Error('Gemini AI no está configurado. Por favor contacta al soporte.')
        }
        
        // Handle rate limits
        if (response.status === 429) {
          throw new Error('Límite de solicitudes excedido. Por favor intenta más tarde.')
        }
        
        // Handle timeouts
        if (response.status === 504) {
          throw new Error('Tiempo de espera agotado. Por favor intenta de nuevo.')
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      // Handle error responses
      if (!data.success) {
        // Don't retry if API key is not configured
        if (data.error?.includes('API key') || data.error?.includes('not configured')) {
          throw new Error('Gemini AI no está configurado. Por favor contacta al soporte.')
        }
        throw new Error(data.error || 'Error en la API de Gemini')
      }
      
      // Return text response (provider expects string)
      return data.response || data.text || data.data || ''
    } catch (error: any) {
      // Re-throw with user-friendly message
      if (error.message) {
        throw error
      }
      throw new Error('Error al conectar con Gemini AI. Por favor intenta más tarde.')
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

