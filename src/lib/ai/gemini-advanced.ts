// src/lib/ai/gemini-advanced.ts - Google Gemini AI SDK Integration with Multi-Model Fallback
// Production-ready implementation with JSON extraction, error handling, and model fallback chain

import { GoogleGenerativeAI } from '@google/generative-ai'

// Get API key helper function (lazy initialization)
function getApiKey(): string | null {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || null
}

// Get or create Gemini instance (lazy initialization)
let genAI: GoogleGenerativeAI | null = null
function getGenAI(): GoogleGenerativeAI | null {
  if (!genAI) {
    const apiKey = getApiKey()
    if (apiKey) {
      genAI = new GoogleGenerativeAI(apiKey)
    } else {
      console.error('[AI] GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY is not set')
    }
  }
  return genAI
}

// Model fallback chain (ordered by preference)
// Updated November 2025: Only using Gemini 2.5 models
// IMPORTANT: Gemini 1.5 models were discontinued September 24, 2025
// Reference: https://ai.google.dev/gemini-api/docs/models
// Note: gemini-pro, gemini-pro-vision, gemini-1.5-*, and gemini-2.0-* are NOT available
const modelsToTry = [
  'gemini-2.5-flash',      // Primary - Fastest, latest (November 2025 - confirmed available)
  'gemini-2.5-flash-lite', // Fallback 1 - Lighter version of 2.5-flash
  'gemini-2.5-pro'         // Fallback 2 - More capable (if available)
]

// Generation configuration
const defaultGenerationConfig = {
  temperature: 0.7,      // Balanced creativity
  topP: 0.9,             // Nucleus sampling
  topK: 40,              // Top-k sampling
  maxOutputTokens: 2048, // Max response length
}

// Response interface
export interface GeminiResponse {
  data: any
  modelUsed: string
  rawText?: string
}

// Options for generateContent
export interface GeminiOptions {
  temperature?: number
  topP?: number
  topK?: number
  maxOutputTokens?: number
  returnRawText?: boolean
  expectJSON?: boolean
}

/**
 * Call Gemini AI with automatic fallback chain
 * @param prompt - The prompt to send to Gemini
 * @param options - Optional configuration
 * @returns Promise with parsed data and model used
 */
export async function callGemini(
  prompt: string,
  options: GeminiOptions = {}
): Promise<GeminiResponse> {
  const ai = getGenAI()
  if (!ai) {
    throw new Error('Gemini API key not configured. Set GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY')
  }

  const {
    temperature = defaultGenerationConfig.temperature,
    topP = defaultGenerationConfig.topP,
    topK = defaultGenerationConfig.topK,
    maxOutputTokens = defaultGenerationConfig.maxOutputTokens,
    returnRawText = false,
    expectJSON = false
  } = options

  let result: any = null
  let modelUsed: string = ''
  let lastError: Error | null = null
  let rawText: string = ''

  // Try each model in fallback chain
  for (const modelName of modelsToTry) {
    try {
      const model = ai.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature,
          topP,
          topK,
          maxOutputTokens
        }
      })

      const generationResult = await model.generateContent(prompt)
      const response = generationResult.response
      rawText = response.text()
      
      result = rawText
      modelUsed = modelName
      
      console.log(`[AI] Successfully used model: ${modelName}`)
      break
    } catch (error: any) {
      lastError = error
      console.warn(`[AI] Model ${modelName} failed:`, error.message)
      
      // If it's a quota/rate limit error, don't try other models
      if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
        throw new Error(`Quota/Rate limit exceeded: ${error.message}`)
      }
      
      continue
    }
  }

  if (!result) {
    throw new Error(`All Gemini models failed. Last error: ${lastError?.message || 'Unknown error'}`)
  }

  // Extract JSON if expected
  if (expectJSON || returnRawText) {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          data: parsed,
          modelUsed,
          rawText: returnRawText ? rawText : undefined
        }
      } catch (parseError) {
        // If JSON parsing fails but JSON was expected, return raw text
        console.warn('[AI] JSON parsing failed, returning raw text')
        return {
          data: rawText,
          modelUsed,
          rawText: returnRawText ? rawText : undefined
        }
      }
    }
  }

  return {
    data: result,
    modelUsed,
    rawText: returnRawText ? rawText : undefined
  }
}

/**
 * Generate structured JSON response from Gemini
 * @param prompt - Prompt that requests JSON response
 * @param schema - Optional JSON schema description for validation
 * @returns Parsed JSON object
 */
export async function callGeminiJSON(
  prompt: string,
  schema?: string
): Promise<any> {
  const jsonPrompt = schema
    ? `${prompt}\n\nRespond with valid JSON matching this schema: ${schema}\n\nReturn ONLY the JSON object, no markdown, no explanations.`
    : `${prompt}\n\nRespond with valid JSON only. No markdown, no explanations, just the JSON object.`

  const response = await callGemini(jsonPrompt, { expectJSON: true })
  return response.data
}

/**
 * Generate text response (no JSON parsing)
 * @param prompt - The prompt
 * @returns Raw text response
 */
export async function callGeminiText(
  prompt: string
): Promise<string> {
  const response = await callGemini(prompt, { returnRawText: true })
  return typeof response.data === 'string' ? response.data : response.rawText || ''
}

