import { Logger } from './logger';
import { Order } from './types';

export class WalletFilter {
  private walletAddress: string;

  constructor(walletAddress: string) {
    if (!walletAddress || walletAddress.trim().length === 0) {
      throw new Error('Invalid wallet address: address cannot be empty');
    }
    this.walletAddress = walletAddress.toLowerCase().trim();
    Logger.info('WalletFilter initialized', { walletAddress: this.walletAddress });
  }

  /**
   * Check if wallet address is present in an order
   */
  isWalletInOrder(order: Order): boolean {
    const walletLower = this.walletAddress;
    
    // Check common wallet-related fields
    const fieldsToCheck = [
      'takerAddress',
      'makerAddress',
      'walletAddress',
      'userAddress',
      'senderAddress',
      'receiverAddress',
      'recipient',
      'sender'
    ];

    return fieldsToCheck.some(field => {
      const value = order[field];
      if (typeof value === 'string') {
        return value.toLowerCase() === walletLower;
      }
      return false;
    });
  }

  /**
   * Filter orders by wallet address
   */
  filterOrders(orders: Order[]): Order[] {
    Logger.info('Filtering orders', { 
      totalOrders: orders.length, 
      walletAddress: this.walletAddress 
    });

    const filtered = orders.filter(order => this.isWalletInOrder(order));

    Logger.info('Orders filtered', { 
      original: orders.length, 
      filtered: filtered.length,
      walletAddress: this.walletAddress 
    });

    return filtered;
  }

  /**
   * Get wallet address
   */
  getWalletAddress(): string {
    return this.walletAddress;
  }
}

export default WalletFilter;
