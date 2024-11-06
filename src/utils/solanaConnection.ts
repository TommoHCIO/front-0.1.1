import { Connection, ConnectionConfig } from '@solana/web3.js';
import { SOLANA_CONSTANTS } from './constants';

export class SolanaConnectionManager {
  private static instance: SolanaConnectionManager;
  private connections: Connection[];
  private currentIndex: number;
  private healthChecks: boolean[];

  private constructor() {
    this.connections = SOLANA_CONSTANTS.RPC_ENDPOINTS.map(
      endpoint => new Connection(endpoint, SOLANA_CONSTANTS.CONNECTION_CONFIG)
    );
    this.currentIndex = 0;
    this.healthChecks = SOLANA_CONSTANTS.RPC_ENDPOINTS.map(() => true);
  }

  public static getInstance(): SolanaConnectionManager {
    if (!SolanaConnectionManager.instance) {
      SolanaConnectionManager.instance = new SolanaConnectionManager();
    }
    return SolanaConnectionManager.instance;
  }

  private async checkConnectionHealth(index: number): Promise<boolean> {
    try {
      const connection = this.connections[index];
      const blockHeight = await connection.getBlockHeight('confirmed');
      return blockHeight > 0;
    } catch {
      return false;
    }
  }

  private async findHealthyConnection(): Promise<Connection> {
    for (let i = 0; i < this.connections.length; i++) {
      const index = (this.currentIndex + i) % this.connections.length;
      
      if (await this.checkConnectionHealth(index)) {
        this.currentIndex = index;
        this.healthChecks[index] = true;
        return this.connections[index];
      }
      
      this.healthChecks[index] = false;
    }
    
    throw new Error('No healthy Solana RPC connections available');
  }

  public async getConnection(): Promise<Connection> {
    if (!this.healthChecks[this.currentIndex]) {
      return this.findHealthyConnection();
    }
    return this.connections[this.currentIndex];
  }

  public async executeWithRetry<T>(
    operation: (connection: Connection) => Promise<T>,
    retries = SOLANA_CONSTANTS.MAX_RETRIES
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const connection = await this.getConnection();
        return await operation(connection);
      } catch (error: any) {
        lastError = error;
        this.healthChecks[this.currentIndex] = false;
        
        if (attempt < retries) {
          await new Promise(resolve => 
            setTimeout(resolve, SOLANA_CONSTANTS.RETRY_DELAY * Math.pow(2, attempt))
          );
          continue;
        }
      }
    }

    throw lastError || new Error('Operation failed after all retries');
  }
}