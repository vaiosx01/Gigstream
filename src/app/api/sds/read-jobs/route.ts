// src/app/api/sds/read-jobs/route.ts - Read Jobs from Somnia Data Streams
// API endpoint to read job data from Somnia Data Streams

import { NextRequest, NextResponse } from 'next/server'
import { createSDSClient, getJobSchemaId, readJobFromDataStream } from '@/lib/somnia-sds'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/sds/read-jobs
 * Reads job data from Somnia Data Streams for a specific publisher
 * 
 * Query params:
 *   publisher: string (0x address) - required
 *   limit?: number - optional, default 50
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const publisher = searchParams.get('publisher') as `0x${string}` | null
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!publisher) {
      return NextResponse.json(
        { error: 'publisher parameter is required' },
        { status: 400 }
      )
    }

    // Validate address format
    if (!publisher.startsWith('0x') || publisher.length !== 42) {
      return NextResponse.json(
        { error: 'Invalid publisher address format' },
        { status: 400 }
      )
    }

    // Get schema ID
    const schemaId = await getJobSchemaId()

    // Read jobs from Data Streams
    const jobs = await readJobFromDataStream(schemaId, publisher)

    // Limit results
    const limitedJobs = jobs.slice(0, limit)

    return NextResponse.json({
      success: true,
      jobs: limitedJobs,
      total: jobs.length,
      schemaId,
      publisher,
    })
  } catch (error: any) {
    console.error('Error reading jobs from Data Streams:', error)
    
    // Handle NoData error gracefully
    if (error?.message?.includes('NoData') || error?.shortMessage?.includes('NoData')) {
      return NextResponse.json({
        success: true,
        jobs: [],
        total: 0,
        message: 'No jobs found in Data Streams for this publisher',
      })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to read jobs from Data Streams' },
      { status: 500 }
    )
  }
}

