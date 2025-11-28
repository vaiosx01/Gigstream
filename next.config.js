/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SOMNIA_RPC_URL: process.env.NEXT_PUBLIC_SOMNIA_RPC_URL,
    NEXT_PUBLIC_SOMNIA_CHAIN_ID: process.env.NEXT_PUBLIC_SOMNIA_CHAIN_ID,
    NEXT_PUBLIC_REOWN_PROJECT_ID: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID,
    // Gemini API keys (server-side only, not exposed to client)
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  },
  webpack: (config, { isServer }) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    // Ensure @google/generative-ai is only used on server-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
}

module.exports = nextConfig

