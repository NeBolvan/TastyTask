import APIClient from './api-client';
import WalletFilter from './wallet-filter';
import WalletValidator from './wallet-validator';
import { Logger } from './logger';
import { Order, OrderDetails, ValidationResult, FetcherOptions } from './types';

export class OrdersFetcher {
  private apiClient: APIClient;
  private walletFilter: WalletFilter;
  private walletValidator: WalletValidator;
  private options: FetcherOptions;

  constructor(options: FetcherOptions, baseUrl?: string) {
    // Validate options
    if (!options.walletAddress) {
      throw new Error('Wallet address is required');
    }
    if (!options.pageSize || options.pageSize < 1) {
      throw new Error('Page size must be at least 1');
    }

    this.options = {
      ...options,
      loggingEnabled: options.loggingEnabled !== false
    };

    // Configure logger
    Logger.setConfig({ enabled: this.options.loggingEnabled });

    this.apiClient = new APIClient(baseUrl);
    this.walletFilter = new WalletFilter(options.walletAddress);
    this.walletValidator = new WalletValidator(options.walletAddress);

    Logger.info('OrdersFetcher initialized', {
      walletAddress: options.walletAddress,
      pageSize: options.pageSize,
      maxPages: options.maxPages
    });
  }

  /**
   * Execute the complete workflow:
   * 1. Fetch orders with pagination
   * 2. Filter by wallet
   * 3. Fetch order details
   * 4. Validate wallet presence
   */
  async execute(): Promise<ValidationResult[]> {
    try {
      Logger.info('Starting OrdersFetcher execution');

      // Step 1: Fetch orders
      Logger.info('Step 1: Fetching orders with pagination');
      const orders = await this.apiClient.fetchAllOrdersWithPagination(
        this.options.pageSize,
        this.options.maxPages
      );

      if (orders.length === 0) {
        Logger.warn('No orders fetched');
        return [];
      }

      // Step 2: Filter by wallet
      Logger.info('Step 2: Filtering orders by wallet');
      const filteredOrders = this.walletFilter.filterOrders(orders);

      if (filteredOrders.length === 0) {
        Logger.warn('No orders matched the wallet filter');
        return [];
      }

      // Step 3: Fetch order details and validate
      Logger.info('Step 3: Fetching order details and validating');
      const validationResults: ValidationResult[] = [];

      for (const order of filteredOrders) {
        try {
          const orderId = order.id || order.orderId;
          Logger.debug('Processing order', { orderId });

          const orderDetails = await this.apiClient.fetchOrderDetails(orderId);
          const validationResult = this.walletValidator.validate(orderDetails);

          validationResults.push(validationResult);

          if (!validationResult.isValid) {
            Logger.warn('Order details validation failed', {
              orderId,
              fields: validationResult.foundInFields.join(', ')
            });
          } else {
            Logger.debug('Order details validation passed', {
              orderId,
              foundInFields: validationResult.foundInFields.join(', ')
            });
          }
        } catch (error) {
          Logger.error('Failed to process order', error, { 
            orderId: order.id || order.orderId 
          });
        }
      }

      Logger.info('Fetcher execution complete', {
        ordersProcessed: filteredOrders.length,
        validationsPassed: validationResults.filter(r => r.isValid).length,
        validationsFailed: validationResults.filter(r => !r.isValid).length
      });

      return validationResults;
    } catch (error) {
      Logger.error('Fatal error during execution', error);
      throw error;
    }
  }

  /**
   * Get summary of results
   */
  static getSummary(results: ValidationResult[]): { passed: number; failed: number; total: number } {
    const passed = results.filter(r => r.isValid).length;
    const failed = results.length - passed;

    return {
      passed,
      failed,
      total: results.length
    };
  }

  /**
   * Print results in a human-readable format
   */
  static printResults(results: ValidationResult[]): void {
    const summary = OrdersFetcher.getSummary(results);

    console.log('\n========== RESULTS ==========');
    console.log(`Total Orders Processed: ${summary.total}`);
    console.log(`Passed Validation: ${summary.passed}`);
    console.log(`Failed Validation: ${summary.failed}`);
    console.log('==============================\n');

    results.forEach((result, index) => {
      const status = result.isValid ? '✓' : '✗';
      const fields = result.foundInFields.length > 0 
        ? `Found in: ${result.foundInFields.join(', ')}` 
        : 'Wallet not found in any field';
      
      console.log(`${index + 1}. Order ${result.orderId} [${status}] ${fields}`);
    });
  }
}

export default OrdersFetcher;
