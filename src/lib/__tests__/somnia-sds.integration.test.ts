// src/lib/__tests__/somnia-sds.integration.test.ts
// Real integration tests for Somnia Data Streams SDK
// These tests use the real SDK against Somnia Testnet
// Requires: SOMNIA_PRIVATE_KEY environment variable with testnet wallet

import { describe, it, expect, beforeAll } from 'vitest'
import { config } from 'dotenv'
import { resolve } from 'path'
import {
  createSDSClient,
  createSDSWalletClient,
  getJobSchemaId,
  registerJobSchema,
  publishJobToDataStream,
  readJobFromDataStream,
  JOB_SCHEMA,
} from '../somnia-sds'
import { SDK } from '@somnia-chain/streams'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

describe('Somnia SDS SDK - Real Integration Tests', () => {
  // Get private key and normalize it (add 0x prefix if missing)
  let rawPrivateKey = process.env.SOMNIA_PRIVATE_KEY
  let privateKey: `0x${string}` | undefined = undefined
  
  if (rawPrivateKey) {
    // Remove any whitespace
    rawPrivateKey = rawPrivateKey.trim()
    // Add 0x prefix if missing
    if (!rawPrivateKey.startsWith('0x')) {
      privateKey = `0x${rawPrivateKey}` as `0x${string}`
    } else {
      privateKey = rawPrivateKey as `0x${string}`
    }
  }
  
  const hasPrivateKey = !!privateKey && privateKey !== '0x...' && privateKey.length > 10

  describe('SDK Client Creation', () => {
    it('should create a public SDK client successfully', () => {
      const client = createSDSClient()
      expect(client).toBeInstanceOf(SDK)
      expect(client).toBeDefined()
    })

    it('should create a wallet SDK client if private key is provided', () => {
      if (!hasPrivateKey || !privateKey) {
        console.log('⚠️  Skipping: SOMNIA_PRIVATE_KEY not configured')
        return
      }

      const client = createSDSWalletClient(privateKey)
      expect(client).toBeInstanceOf(SDK)
      expect(client).toBeDefined()
      console.log('✅ Wallet SDK client created successfully')
    })
  })

  describe('Schema Operations', () => {
    it('should compute schema ID for JOB_SCHEMA', async () => {
      const schemaId = await getJobSchemaId()
      
      expect(schemaId).toBeDefined()
      expect(typeof schemaId).toBe('string')
      expect(schemaId).toMatch(/^0x[a-fA-F0-9]{64}$/)
      expect(schemaId.length).toBe(66) // 0x + 64 hex chars
      
      console.log('✅ Schema ID computed:', schemaId)
    }, 30000) // 30 second timeout for network calls

    it('should check if schema is registered', async () => {
      const sdk = createSDSClient()
      const schemaId = await getJobSchemaId()
      
      const result = await sdk.streams.isDataSchemaRegistered(schemaId)
      
      if (result instanceof Error) {
        console.error('❌ Error checking schema registration:', result.message)
        throw result
      }
      
      expect(typeof result).toBe('boolean')
      console.log(`✅ Schema registered: ${result}`)
    }, 30000)

    it('should register schema if private key is available', async () => {
      if (!hasPrivateKey || !privateKey) {
        console.log('⚠️  Skipping: SOMNIA_PRIVATE_KEY not configured (required for registration)')
        return
      }

      console.log('🔄 Registering schema with private key...')
      const sdk = createSDSWalletClient(privateKey)
      const schemaId = await registerJobSchema(sdk)
      
      expect(schemaId).toBeDefined()
      expect(schemaId).toMatch(/^0x[a-fA-F0-9]{64}$/)
      console.log('✅ Schema registered with ID:', schemaId)
    }, 120000) // 2 minute timeout for transaction
  })

  describe('Publish Job to Data Streams', () => {
    it('should publish a job to Data Streams if private key is available', async () => {
      if (!hasPrivateKey || !privateKey) {
        console.log('⚠️  Skipping: SOMNIA_PRIVATE_KEY not configured (required for publishing)')
        return
      }

      console.log('🔄 Publishing job to Data Streams...')
      const sdk = createSDSWalletClient(privateKey)
      
      const jobData = {
        jobId: BigInt(Date.now()), // Use timestamp as unique ID
        employer: '0x1234567890123456789012345678901234567890' as `0x${string}`,
        title: 'Test Job - Integration Test',
        location: 'CDMX Testnet',
        reward: '1000',
        deadline: (BigInt(Math.floor(Date.now() / 1000)) + BigInt(86400 * 7)).toString(), // 7 days from now
        timestamp: Math.floor(Date.now() / 1000),
      }

      const txHash = await publishJobToDataStream(sdk, jobData)
      
      expect(txHash).toBeDefined()
      expect(txHash).toMatch(/^0x[a-fA-F0-9]{64}$/)
      console.log('✅ Job published to Data Streams. Transaction:', txHash)
      
      // Wait a bit for the transaction to be mined
      await new Promise(resolve => setTimeout(resolve, 5000))
    }, 120000) // 2 minute timeout for transaction + confirmation
  })

  describe('Read Job from Data Streams', () => {
    it('should read job data from Data Streams (or handle NoData error)', async () => {
      const sdk = createSDSClient()
      const schemaId = await getJobSchemaId()
      
      // Use a test publisher address (you can change this to a real one)
      const testPublisher = '0x1234567890123456789012345678901234567890' as `0x${string}`
      
      try {
        const result = await readJobFromDataStream(schemaId, testPublisher)
        
        // Result should be an array (empty if no data, or with jobs if data exists)
        expect(Array.isArray(result)).toBe(true)
        console.log(`✅ Read ${result.length} job${result.length !== 1 ? 's' : ''} from Data Streams`)
        
        if (result.length > 0) {
          console.log('Sample job data:', result[0])
        } else {
          console.log('ℹ️  No data found for this publisher (expected if no jobs published yet)')
        }
      } catch (error: any) {
        // NoData error is expected if no data has been published
        if (error?.message?.includes('NoData') || error?.shortMessage?.includes('NoData')) {
          console.log('ℹ️  NoData error (expected): No jobs published for this publisher yet')
          expect(error).toBeDefined()
        } else {
          throw error
        }
      }
    }, 30000)
  })

  describe('Schema Validation', () => {
    it('should have correct JOB_SCHEMA format', () => {
      expect(JOB_SCHEMA).toContain('uint256 jobId')
      expect(JOB_SCHEMA).toContain('address employer')
      expect(JOB_SCHEMA).toContain('string title')
      expect(JOB_SCHEMA).toContain('string location')
      expect(JOB_SCHEMA).toContain('uint256 reward')
      expect(JOB_SCHEMA).toContain('uint256 deadline')
      expect(JOB_SCHEMA).toContain('uint64 timestamp')
      
      console.log('✅ JOB_SCHEMA format is correct:', JOB_SCHEMA)
    })

    it('should validate schema using SchemaEncoder', async () => {
      const { SchemaEncoder } = await import('@somnia-chain/streams')
      const encoder = new SchemaEncoder(JOB_SCHEMA)
      
      // Test encoding
      const testData = [
        { name: 'jobId', value: '1', type: 'uint256' },
        { name: 'employer', value: '0x1234567890123456789012345678901234567890', type: 'address' },
        { name: 'title', value: 'Test', type: 'string' },
        { name: 'location', value: 'CDMX', type: 'string' },
        { name: 'reward', value: '1000', type: 'uint256' },
        { name: 'deadline', value: '1735689600', type: 'uint256' },
        { name: 'timestamp', value: '1733001600', type: 'uint64' },
      ]
      
      const encoded = encoder.encodeData(testData)
      expect(encoded).toBeDefined()
      expect(encoded).toMatch(/^0x[a-fA-F0-9]+$/)
      
      // Test decoding
      const decoded = encoder.decodeData(encoded)
      expect(Array.isArray(decoded)).toBe(true)
      expect(decoded.length).toBe(7)
      
      console.log('✅ Schema encoding/decoding works correctly')
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid schema ID gracefully', async () => {
      const sdk = createSDSClient()
      const invalidSchemaId = '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`
      
      const result = await sdk.streams.isDataSchemaRegistered(invalidSchemaId)
      
      // Should return boolean (false) or Error
      if (result instanceof Error) {
        console.log('⚠️  Expected error for invalid schema:', result.message)
        expect(result).toBeInstanceOf(Error)
      } else {
        expect(typeof result).toBe('boolean')
      }
    }, 30000)

    it('should handle invalid addresses gracefully', async () => {
      // This test verifies that errors are properly handled
      const sdk = createSDSClient()
      
      // Try to read from zero address (SDK validates this)
      const schemaId = await getJobSchemaId()
      const zeroAddress = '0x0000000000000000000000000000000000000000' as `0x${string}`
      
      try {
        await readJobFromDataStream(schemaId, zeroAddress)
        // Should not reach here
        expect(false).toBe(true)
      } catch (error: any) {
        // SDK should reject zero address
        expect(error).toBeDefined()
        expect(error.message || error.toString()).toContain('address')
        console.log('✅ Zero address validation works correctly:', error.message || error.toString())
      }
    }, 30000)
  })
})

