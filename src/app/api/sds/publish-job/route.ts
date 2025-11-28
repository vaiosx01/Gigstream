// src/app/api/sds/publish-job/route.ts - Publish Job to Somnia Data Streams
// API endpoint to publish job data to Somnia Data Streams after contract event

import { NextRequest, NextResponse } from 'next/server'
import { createSDSWalletClient, publishJobToDataStream } from '@/lib/somnia-sds'

export const runtime = 'nodejs'

/**
 * POST /api/sds/publish-job
 * Publishes job data to Somnia Data Streams
 * 
 * Body: {
 *   jobId: string | bigint
 *   employer: string (0x address)
 *   title: string
 *   location: string
 *   reward: string | bigint
 *   deadline: string | bigint
 *   timestamp?: number (optional)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Check for private key (server-side only)
    const privateKey = process.env.SOMNIA_PRIVATE_KEY as `0x${string}` | undefined
    
    if (!privateKey) {
      return NextResponse.json(
        { error: 'SOMNIA_PRIVATE_KEY not configured. Data Streams publishing requires a wallet.' },
        { status: 500 }
      )
    }

    const body = await req.json()
    const { jobId, employer, title, location, reward, deadline, timestamp } = body

    // Validate required fields
    if (!jobId || !employer || !title || !location || !reward || !deadline) {
      return NextResponse.json(
        { error: 'Missing required fields: jobId, employer, title, location, reward, deadline' },
        { status: 400 }
      )
    }

    // Initialize SDK with wallet
    const sdk = createSDSWalletClient(privateKey)

    // Publish to Data Streams
    const txHash = await publishJobToDataStream(sdk, {
      jobId,
      employer: employer as `0x${string}`,
      title,
      location,
      reward,
      deadline,
      timestamp,
    })

    if (!txHash) {
      return NextResponse.json(
        { error: 'Failed to publish to Data Streams' },
        { status: 500 }
      )
    }

    // Wait for transaction confirmation
    const { createPublicClient, http } = await import('viem')
    const { waitForTransactionReceipt } = await import('viem/actions')
    const { SOMNIA_CONFIG } = await import('@/lib/contracts')
    const publicClient = createPublicClient({
      chain: {
        id: SOMNIA_CONFIG.chainId,
        name: SOMNIA_CONFIG.name,
        nativeCurrency: SOMNIA_CONFIG.nativeCurrency,
        rpcUrls: { default: { http: [SOMNIA_CONFIG.rpcUrl] } },
      },
      transport: http(),
    })
    await waitForTransactionReceipt(publicClient, { hash: txHash })

    return NextResponse.json({
      success: true,
      transactionHash: txHash,
      message: 'Job published to Somnia Data Streams successfully',
    })
  } catch (error: any) {
    console.error('Error publishing job to Data Streams:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to publish job to Data Streams' },
      { status: 500 }
    )
  }
}

