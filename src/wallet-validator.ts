import { Logger } from './logger';
import { OrderDetails, ValidationResult } from './types';

export class WalletValidator {
  private walletAddress: string;

  // Fields to search for wallet presence
  private fieldsToCheck = [
    'takerAddress',
    'makerAddress',
    'walletAddress',
    'userAddress',
    'senderAddress',
    'receiverAddress',
    'recipient',
    'sender',
    'owner',
    'account',
    'from',
    'to',
    'initiator',
    'operator'
  ];

  constructor(walletAddress: string) {
    if (!walletAddress || walletAddress.trim().length === 0) {
      throw new Error('Invalid wallet address: address cannot be empty');
    }
    this.walletAddress = walletAddress.toLowerCase().trim();
    Logger.debug('WalletValidator initialized', { walletAddress: this.walletAddress });
  }

  /**
   * Find all fields where wallet address appears
   */
  private findWalletFields(orderDetails: OrderDetails): string[] {
    const foundFields: string[] = [];
    const walletLower = this.walletAddress;

    for (const field of this.fieldsToCheck) {
      const value = orderDetails[field];
      if (typeof value === 'string' && value.toLowerCase() === walletLower) {
        foundFields.push(field);
      }
    }

    // Also check all fields dynamically in case wallet is in unexpected location
    for (const [key, value] of Object.entries(orderDetails)) {
      if (!this.fieldsToCheck.includes(key) && typeof value === 'string') {
        if (value.toLowerCase() === walletLower && !foundFields.includes(key)) {
          foundFields.push(key);
        }
      }
    }

    return [...new Set(foundFields)]; // Remove duplicates
  }

  /**
   * Validate wallet presence in order details
   */
  validate(orderDetails: OrderDetails): ValidationResult {
    Logger.debug('Validating order', { orderId: orderDetails.id || orderDetails.orderId });

    const foundFields = this.findWalletFields(orderDetails);
    const isValid = foundFields.length > 0;

    const result: ValidationResult = {
      orderId: orderDetails.id || orderDetails.orderId || 'unknown',
      isValid,
      foundInFields: foundFields,
      details: orderDetails
    };

    Logger.debug('Validation result', { 
      orderId: result.orderId,
      isValid,
      foundInFields: foundFields.join(', ')
    });

    return result;
  }

  /**
   * Validate multiple orders
   */
  validateMultiple(ordersDetails: OrderDetails[]): ValidationResult[] {
    Logger.info('Validating multiple orders', { count: ordersDetails.length });

    const results = ordersDetails.map(details => this.validate(details));

    const validCount = results.filter(r => r.isValid).length;
    Logger.info('Validation complete', { 
      total: results.length, 
      valid: validCount, 
      invalid: results.length - validCount 
    });

    return results;
  }

  /**
   * Get wallet address
   */
  getWalletAddress(): string {
    return this.walletAddress;
  }
}

export default WalletValidator;
