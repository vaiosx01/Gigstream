// src/lib/utils.ts - Shadcn Utils + Somnia Helpers
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// STT Formatter (Somnia Test Token)
export function formatSTT(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'STT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num)
}

// Copy to Clipboard
export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}

// Somnia Explorer Link
export function explorerLink(hash: string) {
  return `https://somnia-testnet.explorer.somnia.network/tx/${hash}`
}

