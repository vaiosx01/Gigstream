// src/app/api/gemini/route.ts - Google Gemini AI SDK Integration
// Production-ready API route with multi-model fallback and structured responses

import { NextRequest, NextResponse } from 'next/server'
import { callGemini, callGeminiJSON, callGeminiText } from '@/lib/ai/gemini-advanced'

// Force Node.js runtime for Vercel (required for @google/generative-ai)
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  // Set timeout for production (Vercel has 60s limit for Hobby, 300s for Pro)
  const timeout = 55000 // 55 seconds to be safe
  
  try {
    // Check if API key is configured early to avoid unnecessary processing
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      console.error('[API] Gemini API key not configured')
      return NextResponse.json(
        {
          success: false,
          error: 'Gemini API key not configured. Please set GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY environment variable in Vercel.',
          timestamp: new Date().toISOString()
        },
        { status: 503 } // Service Unavailable - not an error, just not configured
      )
    }

    // Parse request body (with short timeout for parsing)
    const bodyPromise = req.json()
    const parseTimeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request parsing timeout')), 5000)
    )
    
    const body = await Promise.race([bodyPromise, parseTimeoutPromise]) as any
    const { prompt, context, expectJSON, options } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Prompt is required and must be a string' },
        { status: 400 }
      )
    }

    // Build structured prompt with context
    const fullPrompt = `
GigStream MX Assistant - Somnia Data Streams Hackathon

USER: ${prompt}
CONTEXT: ${context || 'Mexico freelance marketplace, 56M informal workers. Built on Somnia Network L1 blockchain with real-time Data Streams.'}

INSTRUCTIONS:
- Respond in English
- Be helpful, technical with developers, accessible with users
- Mention Somnia Data Streams (SDS) when relevant
- If JSON is requested, respond ONLY with valid JSON, no markdown or explanations
`

    // Call Gemini with appropriate method based on expectJSON flag
    // Wrap in Promise.race with timeout to avoid exceeding Vercel limits
    const geminiPromise = expectJSON 
      ? callGeminiJSON(fullPrompt)
      : callGemini(fullPrompt, {
          ...options,
          expectJSON: expectJSON || false,
          returnRawText: true
        })
    
    const geminiTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API request timeout')), timeout)
    )
    
    const result = await Promise.race([geminiPromise, geminiTimeoutPromise]) as any

    // Extract text response for compatibility with provider
    const textResponse = result.rawText || (typeof result.data === 'string' ? result.data : JSON.stringify(result.data))
    
    return NextResponse.json({
      success: true,
      data: result.data || result,
      response: textResponse, // Primary field for provider compatibility
      text: textResponse,     // Fallback field for provider compatibility
      modelUsed: result.modelUsed || 'unknown',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('[API] Gemini error:', error)
    
    // Handle specific error types
    let statusCode = 500
    let errorMessage = error.message || 'Gemini API error'
    
    if (error.message?.includes('timeout')) {
      statusCode = 504 // Gateway Timeout
      errorMessage = 'Request timeout. Please try again.'
    } else if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      statusCode = 429 // Too Many Requests
      errorMessage = 'API rate limit exceeded. Please try again later.'
    } else if (error.message?.includes('API key') || error.message?.includes('not configured')) {
      statusCode = 503 // Service Unavailable
      errorMessage = 'Gemini API key not configured. Please contact support.'
    }
    
    // Return structured error response
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    )
  }
}

