// src/app/api/streams/route.ts - Somnia Data Streams Integration
// Using official @somnia-chain/streams SDK for Somnia Network's high-throughput real-time data streams
import { NextRequest } from 'next/server'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { SDK } from '@somnia-chain/streams'
import { gigEscrowAbi } from '@/lib/viem'
import { GIGESCROW_ADDRESS, SOMNIA_CONFIG } from '@/lib/contracts'
import { 
  createSDSWalletClient, 
  publishJobToDataStream,
  publishBidToDataStream,
  publishJobCompletedToDataStream,
  publishJobCancelledToDataStream,
  publishReputationUpdatedToDataStream
} from '@/lib/somnia-sds'

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

// Helper to get SDK for publishing (if private key is configured)
function getWalletSdk() {
  const privateKey = process.env.SOMNIA_PRIVATE_KEY as `0x${string}` | undefined
  if (!privateKey) {
    return null
  }
  return createSDSWalletClient(privateKey)
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
    const walletSdk = getWalletSdk()
    if (!walletSdk) return

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
    console.error('Failed to publish job to Data Streams:', error)
  }
}

// Helper to publish bid to Data Streams
async function publishBidToSDS(bidData: {
  jobId: string
  worker: string
  bid: string
  timestamp: string
}) {
  try {
    const walletSdk = getWalletSdk()
    if (!walletSdk) return

    await publishBidToDataStream(walletSdk, {
      jobId: bidData.jobId,
      worker: bidData.worker as `0x${string}`,
      bid: bidData.bid,
      timestamp: parseInt(bidData.timestamp) || Math.floor(Date.now() / 1000),
    })
  } catch (error) {
    console.error('Failed to publish bid to Data Streams:', error)
  }
}

// Helper to publish job completion to Data Streams
async function publishJobCompletedToSDS(completionData: {
  jobId: string
  worker: string
  reward: string
}) {
  try {
    const walletSdk = getWalletSdk()
    if (!walletSdk) return

    await publishJobCompletedToDataStream(walletSdk, {
      jobId: completionData.jobId,
      worker: completionData.worker as `0x${string}`,
      reward: completionData.reward,
      timestamp: Math.floor(Date.now() / 1000),
    })
  } catch (error) {
    console.error('Failed to publish job completion to Data Streams:', error)
  }
}

// Helper to publish job cancellation to Data Streams
async function publishJobCancelledToSDS(cancellationData: {
  jobId: string
  employer: string
  refundAmount: string
}) {
  try {
    const walletSdk = getWalletSdk()
    if (!walletSdk) return

    await publishJobCancelledToDataStream(walletSdk, {
      jobId: cancellationData.jobId,
      employer: cancellationData.employer as `0x${string}`,
      refundAmount: cancellationData.refundAmount,
      timestamp: Math.floor(Date.now() / 1000),
    })
  } catch (error) {
    console.error('Failed to publish job cancellation to Data Streams:', error)
  }
}

// Helper to publish reputation update to Data Streams
async function publishReputationUpdatedToSDS(reputationData: {
  user: string
  reputation: string
}) {
  try {
    const walletSdk = getWalletSdk()
    if (!walletSdk) return

    await publishReputationUpdatedToDataStream(walletSdk, {
      user: reputationData.user as `0x${string}`,
      reputation: reputationData.reputation,
      timestamp: Math.floor(Date.now() / 1000),
    })
  } catch (error) {
    console.error('Failed to publish reputation update to Data Streams:', error)
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
                const bidData = {
                  type: 'BidPlaced',
                  jobId: log.args.jobId?.toString() || '',
                  worker: log.args.worker || '',
                  bid: log.args.bid?.toString() || '0',
                  timestamp: log.args.timestamp?.toString() || '0',
                  blockNumber: log.blockNumber?.toString(),
                  transactionHash: log.transactionHash
                }

                // Stream the event to client
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(bidData)}\n\n`)
                )

                // Publish to Data Streams (async, non-blocking)
                publishBidToSDS({
                  jobId: bidData.jobId,
                  worker: bidData.worker,
                  bid: bidData.bid,
                  timestamp: bidData.timestamp,
                }).catch((err) => {
                  console.error('Background Data Streams publish failed:', err)
                })
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
                const completionData = {
                  type: 'JobCompleted',
                  jobId: log.args.jobId?.toString() || '',
                  worker: log.args.worker || '',
                  reward: log.args.reward?.toString() || '0',
                  blockNumber: log.blockNumber?.toString(),
                  transactionHash: log.transactionHash
                }

                // Stream the event to client
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(completionData)}\n\n`)
                )

                // Publish to Data Streams (async, non-blocking)
                publishJobCompletedToSDS({
                  jobId: completionData.jobId,
                  worker: completionData.worker,
                  reward: completionData.reward,
                }).catch((err) => {
                  console.error('Background Data Streams publish failed:', err)
                })
              })
            }
          })
        } else if (streamType === 'cancellations') {
          // Watch for JobCancelled events
          unwatch = publicClient.watchEvent({
            address: CONTRACT_ADDRESS,
            event: parseAbiItem('event JobCancelled(uint256 indexed jobId, address indexed employer, uint256 refundAmount)'),
            onLogs: (logs) => {
              logs.forEach((log) => {
                const cancellationData = {
                  type: 'JobCancelled',
                  jobId: log.args.jobId?.toString() || '',
                  employer: log.args.employer || '',
                  refundAmount: log.args.refundAmount?.toString() || '0',
                  blockNumber: log.blockNumber?.toString(),
                  transactionHash: log.transactionHash
                }

                // Stream the event to client
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(cancellationData)}\n\n`)
                )

                // Publish to Data Streams (async, non-blocking)
                publishJobCancelledToSDS({
                  jobId: cancellationData.jobId,
                  employer: cancellationData.employer,
                  refundAmount: cancellationData.refundAmount,
                }).catch((err) => {
                  console.error('Background Data Streams publish failed:', err)
                })
              })
            }
          })
        } else if (streamType === 'reputation') {
          // Watch for ReputationUpdated events
          unwatch = publicClient.watchEvent({
            address: CONTRACT_ADDRESS,
            event: parseAbiItem('event ReputationUpdated(address indexed user, uint256 newReputation)'),
            onLogs: (logs) => {
              logs.forEach((log) => {
                const reputationData = {
                  type: 'ReputationUpdated',
                  user: log.args.user || '',
                  reputation: log.args.newReputation?.toString() || '0',
                  blockNumber: log.blockNumber?.toString(),
                  transactionHash: log.transactionHash
                }

                // Stream the event to client
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(reputationData)}\n\n`)
                )

                // Publish to Data Streams (async, non-blocking)
                publishReputationUpdatedToSDS({
                  user: reputationData.user,
                  reputation: reputationData.reputation,
                }).catch((err) => {
                  console.error('Background Data Streams publish failed:', err)
                })
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

