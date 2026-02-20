import OrdersFetcher from './orders-fetcher';
import { Logger } from './logger';

const WALLET_ADDRESS = 'BUnGokFzA1wu8vb6adHfyhnNvCxaVt6QyPNmmUNWPwET';
const PAGE_SIZE = 25;

async function main() {
  try {
    Logger.info('Application started');

    const fetcher = new OrdersFetcher(
      {
        walletAddress: WALLET_ADDRESS,
        pageSize: PAGE_SIZE,
        maxPages: undefined, // Fetch all pages
        loggingEnabled: true
      }
      // Using default API base URL
    );

    const results = await fetcher.execute();

    // Print results
    OrdersFetcher.printResults(results);

    // Exit with appropriate code
    const summary = OrdersFetcher.getSummary(results);
    process.exit(summary.failed === 0 ? 0 : 1);
  } catch (error) {
    Logger.error('Application error', error);
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
