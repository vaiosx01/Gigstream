// src/lib/somnia-sds.ts - Somnia Data Streams SDK Utilities
// Utilities for working with @somnia-chain/streams SDK

import { SDK, SchemaEncoder, zeroBytes32 } from '@somnia-chain/streams'
import { createPublicClient, createWalletClient, http, toHex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { SOMNIA_CONFIG } from './contracts'

/**
 * Data Stream Schemas
 * Defines the structure for all event data in Somnia Data Streams
 */
export const JOB_SCHEMA = 'uint256 jobId, address employer, string title, string location, uint256 reward, uint256 deadline, uint64 timestamp'
export const BID_SCHEMA = 'uint256 jobId, address worker, uint256 bid, uint64 timestamp'
export const JOB_COMPLETED_SCHEMA = 'uint256 jobId, address worker, uint256 reward, uint64 timestamp'
export const JOB_CANCELLED_SCHEMA = 'uint256 jobId, address employer, uint256 refundAmount, uint64 timestamp'
export const REPUTATION_SCHEMA = 'address user, uint256 reputation, uint64 timestamp'

/**
 * Initialize Somnia SDS SDK with public client only (for reading)
 */
export function createSDSClient() {
  const publicClient = createPublicClient({
    chain: {
      id: SOMNIA_CONFIG.chainId,
      name: SOMNIA_CONFIG.name,
      nativeCurrency: SOMNIA_CONFIG.nativeCurrency,
      rpcUrls: {
        default: {
          http: [SOMNIA_CONFIG.rpcUrl],
        },
      },
    },
    transport: http(SOMNIA_CONFIG.rpcUrl),
  })

  return new SDK({
    public: publicClient,
  })
}

/**
 * Initialize Somnia SDS SDK with wallet client (for writing)
 * Note: This requires a private key, use only on server-side
 */
export function createSDSWalletClient(privateKey: `0x${string}`) {
  const account = privateKeyToAccount(privateKey)
  
  const publicClient = createPublicClient({
    chain: {
      id: SOMNIA_CONFIG.chainId,
      name: SOMNIA_CONFIG.name,
      nativeCurrency: SOMNIA_CONFIG.nativeCurrency,
      rpcUrls: {
        default: {
          http: [SOMNIA_CONFIG.rpcUrl],
        },
      },
    },
    transport: http(SOMNIA_CONFIG.rpcUrl),
  })

  const walletClient = createWalletClient({
    chain: {
      id: SOMNIA_CONFIG.chainId,
      name: SOMNIA_CONFIG.name,
      nativeCurrency: SOMNIA_CONFIG.nativeCurrency,
      rpcUrls: {
        default: {
          http: [SOMNIA_CONFIG.rpcUrl],
        },
      },
    },
    account,
    transport: http(SOMNIA_CONFIG.rpcUrl),
  })

  return new SDK({
    public: publicClient,
    wallet: walletClient,
  })
}

/**
 * Compute schema ID for job schema
 */
export async function getJobSchemaId(): Promise<`0x${string}`> {
  const sdk = createSDSClient()
  const result = await sdk.streams.computeSchemaId(JOB_SCHEMA)
  if (result instanceof Error) {
    throw result
  }
  return result
}

/**
 * Register job schema if not already registered
 */
export async function registerJobSchema(sdk: SDK): Promise<`0x${string}`> {
  return registerSchema(sdk, JOB_SCHEMA, 'GigStreamJob')
}

/**
 * Publish job data to Somnia Data Streams
 */
export async function publishJobToDataStream(
  sdk: SDK,
  jobData: {
    jobId: bigint | string
    employer: `0x${string}`
    title: string
    location: string
    reward: bigint | string
    deadline: bigint | string
    timestamp?: number
  }
): Promise<`0x${string}` | null> {
  // Check if SDK was initialized with wallet (required for writing)
  // The SDK constructor requires wallet for write operations
  // We'll check by trying to use it - if it fails, we know wallet is missing

  // Register schema if needed
  const schemaId = await registerJobSchema(sdk) as `0x${string}`

  // Create encoder
  const encoder = new SchemaEncoder(JOB_SCHEMA)

  // Encode job data
  const timestamp = jobData.timestamp || Math.floor(Date.now() / 1000)
  const data = encoder.encodeData([
    { name: 'jobId', value: jobData.jobId.toString(), type: 'uint256' },
    { name: 'employer', value: jobData.employer, type: 'address' },
    { name: 'title', value: jobData.title, type: 'string' },
    { name: 'location', value: jobData.location, type: 'string' },
    { name: 'reward', value: jobData.reward.toString(), type: 'uint256' },
    { name: 'deadline', value: jobData.deadline.toString(), type: 'uint256' },
    { name: 'timestamp', value: timestamp.toString(), type: 'uint64' },
  ])

  // Create unique data ID
  const dataId = toHex(`job-${jobData.jobId}-${timestamp}`, { size: 32 })

  // Publish to Data Streams
  // Use 'set' method when we only have data (no events)
  // 'setAndEmitEvents' requires events array to be non-empty
  const txResult = await sdk.streams.set(
    [{ id: dataId, schemaId, data }]
  )

  if (txResult instanceof Error) {
    throw txResult
  }

  return txResult
}

/**
 * Register schema helper (generic)
 */
async function registerSchema(sdk: SDK, schema: string, schemaName: string): Promise<`0x${string}`> {
  const schemaIdResult = await sdk.streams.computeSchemaId(schema)
  if (schemaIdResult instanceof Error) {
    throw schemaIdResult
  }
  const schemaId = schemaIdResult

  const existsResult = await sdk.streams.isDataSchemaRegistered(schemaId)
  if (existsResult instanceof Error) {
    throw existsResult
  }
  const exists = existsResult
  
  if (!exists) {
    const txResult = await sdk.streams.registerDataSchemas([
      {
        schemaName,
        schema,
        parentSchemaId: zeroBytes32 as `0x${string}`,
      }
    ])
    
    if (txResult instanceof Error) {
      throw txResult
    }
    
    const { waitForTransactionReceipt } = await import('viem/actions')
    const publicClient = createPublicClient({
      chain: {
        id: SOMNIA_CONFIG.chainId,
        name: SOMNIA_CONFIG.name,
        nativeCurrency: SOMNIA_CONFIG.nativeCurrency,
        rpcUrls: {
          default: {
            http: [SOMNIA_CONFIG.rpcUrl],
          },
        },
      },
      transport: http(SOMNIA_CONFIG.rpcUrl),
    })
    
    await waitForTransactionReceipt(publicClient, { hash: txResult })
  }
  
  return schemaId
}

/**
 * Publish bid data to Somnia Data Streams
 */
export async function publishBidToDataStream(
  sdk: SDK,
  bidData: {
    jobId: bigint | string
    worker: `0x${string}`
    bid: bigint | string
    timestamp?: number
  }
): Promise<`0x${string}` | null> {
  const schemaId = await registerSchema(sdk, BID_SCHEMA, 'GigStreamBid') as `0x${string}`
  const encoder = new SchemaEncoder(BID_SCHEMA)
  const timestamp = bidData.timestamp || Math.floor(Date.now() / 1000)
  
  const data = encoder.encodeData([
    { name: 'jobId', value: bidData.jobId.toString(), type: 'uint256' },
    { name: 'worker', value: bidData.worker, type: 'address' },
    { name: 'bid', value: bidData.bid.toString(), type: 'uint256' },
    { name: 'timestamp', value: timestamp.toString(), type: 'uint64' },
  ])

  const dataId = toHex(`bid-${bidData.jobId}-${bidData.worker}-${timestamp}`, { size: 32 })
  const txResult = await sdk.streams.set([{ id: dataId, schemaId, data }])

  if (txResult instanceof Error) {
    throw txResult
  }

  return txResult
}

/**
 * Publish job completion data to Somnia Data Streams
 */
export async function publishJobCompletedToDataStream(
  sdk: SDK,
  completionData: {
    jobId: bigint | string
    worker: `0x${string}`
    reward: bigint | string
    timestamp?: number
  }
): Promise<`0x${string}` | null> {
  const schemaId = await registerSchema(sdk, JOB_COMPLETED_SCHEMA, 'GigStreamJobCompleted') as `0x${string}`
  const encoder = new SchemaEncoder(JOB_COMPLETED_SCHEMA)
  const timestamp = completionData.timestamp || Math.floor(Date.now() / 1000)
  
  const data = encoder.encodeData([
    { name: 'jobId', value: completionData.jobId.toString(), type: 'uint256' },
    { name: 'worker', value: completionData.worker, type: 'address' },
    { name: 'reward', value: completionData.reward.toString(), type: 'uint256' },
    { name: 'timestamp', value: timestamp.toString(), type: 'uint64' },
  ])

  const dataId = toHex(`completed-${completionData.jobId}-${timestamp}`, { size: 32 })
  const txResult = await sdk.streams.set([{ id: dataId, schemaId, data }])

  if (txResult instanceof Error) {
    throw txResult
  }

  return txResult
}

/**
 * Publish job cancellation data to Somnia Data Streams
 */
export async function publishJobCancelledToDataStream(
  sdk: SDK,
  cancellationData: {
    jobId: bigint | string
    employer: `0x${string}`
    refundAmount: bigint | string
    timestamp?: number
  }
): Promise<`0x${string}` | null> {
  const schemaId = await registerSchema(sdk, JOB_CANCELLED_SCHEMA, 'GigStreamJobCancelled') as `0x${string}`
  const encoder = new SchemaEncoder(JOB_CANCELLED_SCHEMA)
  const timestamp = cancellationData.timestamp || Math.floor(Date.now() / 1000)
  
  const data = encoder.encodeData([
    { name: 'jobId', value: cancellationData.jobId.toString(), type: 'uint256' },
    { name: 'employer', value: cancellationData.employer, type: 'address' },
    { name: 'refundAmount', value: cancellationData.refundAmount.toString(), type: 'uint256' },
    { name: 'timestamp', value: timestamp.toString(), type: 'uint64' },
  ])

  const dataId = toHex(`cancelled-${cancellationData.jobId}-${timestamp}`, { size: 32 })
  const txResult = await sdk.streams.set([{ id: dataId, schemaId, data }])

  if (txResult instanceof Error) {
    throw txResult
  }

  return txResult
}

/**
 * Publish reputation update data to Somnia Data Streams
 */
export async function publishReputationUpdatedToDataStream(
  sdk: SDK,
  reputationData: {
    user: `0x${string}`
    reputation: bigint | string
    timestamp?: number
  }
): Promise<`0x${string}` | null> {
  const schemaId = await registerSchema(sdk, REPUTATION_SCHEMA, 'GigStreamReputation') as `0x${string}`
  const encoder = new SchemaEncoder(REPUTATION_SCHEMA)
  const timestamp = reputationData.timestamp || Math.floor(Date.now() / 1000)
  
  const data = encoder.encodeData([
    { name: 'user', value: reputationData.user, type: 'address' },
    { name: 'reputation', value: reputationData.reputation.toString(), type: 'uint256' },
    { name: 'timestamp', value: timestamp.toString(), type: 'uint64' },
  ])

  const dataId = toHex(`reputation-${reputationData.user}-${timestamp}`, { size: 32 })
  const txResult = await sdk.streams.set([{ id: dataId, schemaId, data }])

  if (txResult instanceof Error) {
    throw txResult
  }

  return txResult
}

/**
 * Read job data from Somnia Data Streams
 * Note: The SDK returns data in a structured format
 */
export async function readJobFromDataStream(
  schemaId: `0x${string}`,
  publisher: `0x${string}`
) {
  const sdk = createSDSClient()
  const encoder = new SchemaEncoder(JOB_SCHEMA)
  
  const dataResult = await sdk.streams.getAllPublisherDataForSchema(schemaId, publisher)
  
  if (dataResult instanceof Error) {
    throw dataResult
  }

  // The SDK returns Hex[] | SchemaDecodedItem[][]
  // Check the type and handle accordingly
  if (!Array.isArray(dataResult) || dataResult.length === 0) {
    return []
  }

  // Check if it's SchemaDecodedItem[][] (array of arrays with decoded items)
  const firstItem = dataResult[0]
  if (Array.isArray(firstItem) && firstItem.length > 0 && typeof firstItem[0] === 'object' && 'name' in firstItem[0]) {
    // It's SchemaDecodedItem[][]
    return (dataResult as any[][]).map((decodedItems: any[]) => {
      const job: any = {}
      decodedItems.forEach((item: any) => {
        if (item.name && item.value) {
          job[item.name] = item.value.value || item.value
        }
      })
      return job
    })
  } else {
    // It's Hex[], need to decode
    return (dataResult as `0x${string}`[]).map((hexData: `0x${string}`) => {
      try {
        const decoded = encoder.decodeData(hexData)
        const job: any = {}
        decoded.forEach((item) => {
          job[item.name] = item.value.value || item.value
        })
        return job
      } catch (error) {
        console.error('Error decoding job data:', error)
        return null
      }
    }).filter(Boolean)
  }
}

