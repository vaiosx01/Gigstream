// src/lib/contracts.ts - Contract Configuration for Somnia Network
// Centralized contract addresses and configuration

/**
 * GigEscrow Contract Address
 * Deployed on Somnia Testnet (Shannon) - Chain ID: 50312
 * Latest deployment: 0x7094f1eb1c49Cf89B793844CecE4baE655f3359b
 * Explorer: https://somnia-testnet.explorer.somnia.network/address/0x7094f1eb1c49Cf89B793844CecE4baE655f3359b
 */
export const GIGESCROW_ADDRESS = (
  process.env.NEXT_PUBLIC_GIGESCROW_ADDRESS || 
  '0x7094f1eb1c49Cf89B793844CecE4baE655f3359b'
) as `0x${string}`

/**
 * ReputationToken Contract Address
 * ERC-20 token for reputation points
 * Deployed at: 0x51FBdDcD12704e4FCc28880E22b582362811cCdf
 * Explorer: https://somnia-testnet.explorer.somnia.network/address/0x51FBdDcD12704e4FCc28880E22b582362811cCdf
 */
export const REPUTATION_TOKEN_ADDRESS = (
  process.env.NEXT_PUBLIC_REPUTATION_TOKEN_ADDRESS || 
  '0x51FBdDcD12704e4FCc28880E22b582362811cCdf'
) as `0x${string}`

/**
 * StakingPool Contract Address
 * Staking contract for workers to increase trust
 * Deployed at: 0x77Ee7016BB2A3D4470a063DD60746334c6aD84A4
 * Explorer: https://somnia-testnet.explorer.somnia.network/address/0x77Ee7016BB2A3D4470a063DD60746334c6aD84A4
 */
export const STAKING_POOL_ADDRESS = (
  process.env.NEXT_PUBLIC_STAKING_POOL_ADDRESS || 
  '0x77Ee7016BB2A3D4470a063DD60746334c6aD84A4'
) as `0x${string}`

/**
 * Somnia Network Configuration
 */
export const SOMNIA_CONFIG = {
  chainId: 50312,
  name: 'Somnia Shannon Testnet',
  rpcUrl: process.env.NEXT_PUBLIC_SOMNIA_RPC_URL || 'https://dream-rpc.somnia.network',
  explorerUrl: 'https://shannon-explorer.somnia.network',
  nativeCurrency: {
    name: 'Shannon Test Token',
    symbol: 'STT',
    decimals: 18,
  },
} as const

/**
 * Verify contract address is valid
 */
export function isValidContractAddress(address: string): boolean {
  return address !== '0x0000000000000000000000000000000000000000' && 
         address.startsWith('0x') && 
         address.length === 42
}

