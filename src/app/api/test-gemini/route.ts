// src/app/api/test-gemini/route.ts - Gemini AI Connectivity Test Endpoint
// Use this endpoint to validate Gemini API configuration and connectivity

import { NextRequest, NextResponse } from 'next/server'
import { callGemini, callGeminiJSON } from '@/lib/ai/gemini-advanced'

// Force Node.js runtime for Vercel
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    // Check API key first
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gemini API key not configured',
          configuration: {
            apiKeyConfigured: false,
            envVarUsed: null,
            runtime: 'nodejs'
          },
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      )
    }
    
    // Test 1: Simple text generation
    const testPrompt = 'Respond with "OK" if you can read this message. Include your model name.'
    
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Test timeout')), 30000)
    )
    
    const resultPromise = callGemini(testPrompt, { returnRawText: true })
    const result = await Promise.race([resultPromise, timeoutPromise]) as any
    
    // Test 2: JSON generation (if first test passes)
    let jsonTest = null
    try {
      const jsonPrompt = 'Generate a simple JSON: {"status": "ok", "test": true, "timestamp": "2025-11-01"}'
      const jsonPromise = callGeminiJSON(jsonPrompt)
      const jsonTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('JSON test timeout')), 30000)
      )
      jsonTest = await Promise.race([jsonPromise, jsonTimeoutPromise])
    } catch (jsonError) {
      console.warn('[TEST] JSON test failed:', jsonError)
    }

    return NextResponse.json({
      success: true,
      message: 'Gemini AI is configured correctly',
      tests: {
        textGeneration: {
          passed: true,
          modelUsed: result.modelUsed,
          response: result.data?.substring(0, 100) || result.rawText?.substring(0, 100) || 'No response'
        },
        jsonGeneration: {
          passed: jsonTest !== null,
          result: jsonTest
        }
      },
      configuration: {
        apiKeyConfigured: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY),
        envVarUsed: process.env.GEMINI_API_KEY ? 'GEMINI_API_KEY' : 'GOOGLE_GENERATIVE_AI_API_KEY',
        runtime: 'nodejs'
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('[TEST] Gemini connectivity test failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gemini connectivity test failed',
        configuration: {
          apiKeyConfigured: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY),
          envVarUsed: process.env.GEMINI_API_KEY ? 'GEMINI_API_KEY' : 'GOOGLE_GENERATIVE_AI_API_KEY',
          runtime: 'nodejs'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

