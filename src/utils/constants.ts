import { PublicKey, ConnectionConfig, Commitment } from '@solana/web3.js';

export const SOLANA_CONSTANTS = {
  USDT_MINT: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
  INCUBATOR_WALLET: new PublicKey('H8oTGbCNLRXu844GBRXCAfWTxt6Sa9vB9gut9bLrPdWv'),
  RPC_ENDPOINTS: [
    'https://solana-mainnet.g.alchemy.com/v2/demo',
    'https://api.devnet.solana.com',
    'https://api.testnet.solana.com'
  ],
  CONNECTION_CONFIG: {
    commitment: 'processed' as Commitment,
    confirmTransactionInitialTimeout: 60000,
    disableRetryOnRateLimit: false,
    wsEndpoint: undefined,
  } as ConnectionConfig,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  CONNECTION_TIMEOUT: 15000,
  BALANCE_REFRESH_INTERVAL: 30000,
  MAX_ENDPOINT_RETRIES: 3,
};