// src/app/api/streams/route.ts - Somnia Data Streams Integration
// Using official @somnia-chain/streams SDK for Somnia Network's high-throughput real-time data streams
import { NextRequest } from 'next/server'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { SDK } from '@somnia-chain/streams'
import { gigEscrowAbi } from '@/lib/viem'
import { GIGESCROW_ADDRESS, SOMNIA_CONFIG } from '@/lib/contracts'
import { createSDSWalletClient, publishJobToDataStream } from '@/lib/somnia-sds'

// Force Node.js runtime for Vercel
export const runtime = 'nodejs'

// Somnia Testnet configuration
const somniaTestnet = {
  id: 50312,
  name: 'Somnia Shannon Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Shannon Test Token',
    symbol: 'STT',
  },
  rpcUrls: {
    default: {
      http: [SOMNIA_CONFIG.rpcUrl],
    },
  },
} as const

// Initialize viem public client
const publicClient = createPublicClient({
  chain: somniaTestnet,
  transport: http(somniaTestnet.rpcUrls.default.http[0])
})

// Initialize Somnia SDS SDK (only public client for reading/listening)
const sdsSdk = new SDK({
  public: publicClient,
})

const CONTRACT_ADDRESS = GIGESCROW_ADDRESS

// Helper to get job location from contract
async function getJobLocation(jobId: bigint): Promise<string> {
  try {
    const job = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: gigEscrowAbi,
      functionName: 'getJob',
      args: [jobId],
    })
    return (job as any)?.location || ''
  } catch (error) {
    console.error('Failed to get job location:', error)
    return ''
  }
}

// Helper to publish job to Data Streams (if private key is configured)
async function publishJobToSDS(jobData: {
  jobId: string
  employer: string
  title: string
  location: string
  reward: string
  deadline: string
}) {
  try {
    const privateKey = process.env.SOMNIA_PRIVATE_KEY as `0x${string}` | undefined
    if (!privateKey) {
      // Silently skip if no private key (Data Streams publishing is optional)
      return
    }

    const walletSdk = createSDSWalletClient(privateKey)
    await publishJobToDataStream(walletSdk, {
      jobId: jobData.jobId,
      employer: jobData.employer as `0x${string}`,
      title: jobData.title,
      location: jobData.location || '',
      reward: jobData.reward,
      deadline: jobData.deadline,
      timestamp: Math.floor(Date.now() / 1000),
    })
  } catch (error) {
    // Log but don't fail the stream if Data Streams publishing fails
    console.error('Failed to publish job to Data Streams:', error)
  }
}

/**
 * Server-Sent Events (SSE) stream for Somnia Data Streams
 * Uses official @somnia-chain/streams SDK + viem watchEvent for real-time contract events
 * Streams: JobPosted, BidPlaced, JobCompleted, etc.
 * 
 * The SDK is initialized for potential future use with structured Data Streams,
 * while contract events are monitored via viem's watchEvent for real-time updates.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const streamType = searchParams.get('type') || 'jobs'
  
  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
    return new Response(
      JSON.stringify({ error: 'Contract address not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        // Send initial connection message
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ 
            type: 'connected', 
            streamType,
            contractAddress: CONTRACT_ADDRESS,
            network: 'Somnia Testnet',
            chainId: 50312
          })}\n\n`)
        )

        // Set up event listeners based on stream type
        let unwatch: (() => void) | null = null

        if (streamType === 'jobs') {
          // Watch for JobPosted events
          unwatch = publicClient.watchEvent({
            address: CONTRACT_ADDRESS,
            event: parseAbiItem('event JobPosted(uint256 indexed jobId, address indexed employer, string title, uint256 reward, uint256 deadline)'),
            onLogs: async (logs) => {
              for (const log of logs) {
                const jobData = {
                  type: 'JobPosted',
                  jobId: log.args.jobId?.toString() || '',
                  employer: log.args.employer || '',
                  title: log.args.title || '',
                  reward: log.args.reward?.toString() || '0',
                  deadline: log.args.deadline?.toString() || '0',
                  blockNumber: log.blockNumber?.toString(),
                  transactionHash: log.transactionHash,
                  timestamp: Date.now()
                }

                // Stream the event to client
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(jobData)}\n\n`)
                )

                // Also publish to Somnia Data Streams (async, non-blocking)
                // This enriches the data with structured streams
                // Fetch location from contract and publish
                getJobLocation(BigInt(jobData.jobId))
                  .then((location) => {
                    return publishJobToSDS({
                      jobId: jobData.jobId,
                      employer: jobData.employer,
                      title: jobData.title,
                      location,
                      reward: jobData.reward,
                      deadline: jobData.deadline,
                    })
                  })
                  .catch((err) => {
                    // Silently handle errors - Data Streams publishing is optional
                    console.error('Background Data Streams publish failed:', err)
                  })
              }
            }
          })
        } else if (streamType === 'bids') {
          // Watch for BidPlaced events
          unwatch = publicClient.watchEvent({
            address: CONTRACT_ADDRESS,
            event: parseAbiItem('event BidPlaced(uint256 indexed jobId, address indexed worker, uint256 bid, uint256 timestamp)'),
            onLogs: (logs) => {
              logs.forEach((log) => {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: 'BidPlaced',
                      jobId: log.args.jobId?.toString(),
                      worker: log.args.worker,
                      bid: log.args.bid?.toString(),
                      timestamp: log.args.timestamp?.toString(),
                      blockNumber: log.blockNumber?.toString(),
                      transactionHash: log.transactionHash
                    })}\n\n`
                  )
                )
              })
            }
          })
        } else if (streamType === 'completions') {
          // Watch for JobCompleted events
          unwatch = publicClient.watchEvent({
            address: CONTRACT_ADDRESS,
            event: parseAbiItem('event JobCompleted(uint256 indexed jobId, address indexed worker, uint256 reward)'),
            onLogs: (logs) => {
              logs.forEach((log) => {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: 'JobCompleted',
                      jobId: log.args.jobId?.toString(),
                      worker: log.args.worker,
                      reward: log.args.reward?.toString(),
                      blockNumber: log.blockNumber?.toString(),
                      transactionHash: log.transactionHash
                    })}\n\n`
                  )
                )
              })
            }
          })
        } else {
          // Fallback: mock stream for development
          const interval = setInterval(() => {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ 
                  type: 'update', 
                  streamType,
                  data: { id: Date.now(), message: 'Mock stream data (contract not deployed)' }
                })}\n\n`
              )
            )
          }, 5000)

          req.signal.addEventListener('abort', () => {
            clearInterval(interval)
            controller.close()
          })
          return
        }

        // Cleanup on abort
        req.signal.addEventListener('abort', () => {
          if (unwatch) unwatch()
          controller.close()
        })
      }
    })
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable buffering for nginx
      }
    })
  } catch (error: any) {
    console.error('Stream error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Stream error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

