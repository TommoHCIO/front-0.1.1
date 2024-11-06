import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SOLANA_CONSTANTS } from './constants';

class ConnectionManager {
  private static instance: ConnectionManager;
  private connections: Map<string, Connection>;
  private currentEndpointIndex: number;

  private constructor() {
    this.connections = new Map();
    this.currentEndpointIndex = 0;
    this.initializeConnections();
  }

  private initializeConnections() {
    SOLANA_CONSTANTS.RPC_ENDPOINTS.forEach(endpoint => {
      this.connections.set(endpoint, new Connection(endpoint, SOLANA_CONSTANTS.CONNECTION_CONFIG));
    });
  }

  public static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  private async checkConnection(connection: Connection): Promise<boolean> {
    try {
      const blockHeight = await connection.getBlockHeight('processed');
      return blockHeight > 0;
    } catch {
      return false;
    }
  }

  private getNextEndpoint(): string {
    this.currentEndpointIndex = (this.currentEndpointIndex + 1) % SOLANA_CONSTANTS.RPC_ENDPOINTS.length;
    return SOLANA_CONSTANTS.RPC_ENDPOINTS[this.currentEndpointIndex];
  }

  public async getHealthyConnection(): Promise<Connection> {
    const startIndex = this.currentEndpointIndex;
    let attempts = 0;

    while (attempts < SOLANA_CONSTANTS.RPC_ENDPOINTS.length) {
      const endpoint = SOLANA_CONSTANTS.RPC_ENDPOINTS[this.currentEndpointIndex];
      const connection = this.connections.get(endpoint);

      if (connection) {
        try {
          const isHealthy = await this.checkConnection(connection);
          if (isHealthy) {
            return connection;
          }
        } catch {
          // Connection check failed, try next endpoint
        }
      }

      this.currentEndpointIndex = (this.currentEndpointIndex + 1) % SOLANA_CONSTANTS.RPC_ENDPOINTS.length;
      attempts++;

      if (this.currentEndpointIndex === startIndex) {
        break;
      }
    }

    throw new Error('No healthy RPC endpoints available');
  }
}

export async function getUSDTBalance(): Promise<number> {
  const connectionManager = ConnectionManager.getInstance();
  let attempts = 0;
  let lastError: Error | null = null;

  while (attempts < SOLANA_CONSTANTS.MAX_RETRIES) {
    try {
      const connection = await connectionManager.getHealthyConnection();
      
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        SOLANA_CONSTANTS.INCUBATOR_WALLET,
        { programId: TOKEN_PROGRAM_ID },
        'processed'
      );

      const usdtAccount = tokenAccounts.value.find(
        account => account.account.data.parsed.info.mint === SOLANA_CONSTANTS.USDT_MINT.toString()
      );

      return usdtAccount?.account.data.parsed.info.tokenAmount.uiAmount || 0;
    } catch (error) {
      lastError = error as Error;
      attempts++;
      
      if (attempts < SOLANA_CONSTANTS.MAX_RETRIES) {
        await new Promise(resolve => 
          setTimeout(resolve, SOLANA_CONSTANTS.RETRY_DELAY * Math.pow(2, attempts))
        );
      }
    }
  }

  console.error('Failed to fetch USDT balance after all retries:', lastError);
  return 0;
}