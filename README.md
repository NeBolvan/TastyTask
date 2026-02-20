# TastyTask - deBridge Orders Validator

TypeScript validator for fetching, filtering, and validating orders from deBridge Finance.

## Features

✅ Fetch orders with pagination (25 items/page)
✅ Filter by wallet address
✅ Fetch & validate order details
✅ Winston logging (enable/disable)
✅ Full Jest test coverage
✅ Complete TypeScript type safety

## Setup

```bash
npm install
npm run build
npm test      # Run tests
npm start     # Run app
npm run dev   # Development mode
```

## Project Structure

```
src/
├── api-client.ts           # HTTP client with pagination
├── logger.ts               # Winston logging
├── wallet-filter.ts        # Wallet filtering
├── wallet-validator.ts     # Validation logic
├── orders-fetcher.ts       # Main orchestrator
├── types.ts                # TypeScript interfaces
├── index.ts                # Entry point
└── __tests__/              # Jest tests
```

## Configuration

Edit `src/index.ts`:
```typescript
const WALLET_ADDRESS = 'BUnGokFzA1wu8vb6adHfyhnNvCxaVt6QyPNmmUNWPwET';
const PAGE_SIZE = 25;
```

## Usage

```typescript
import OrdersFetcher from './orders-fetcher';
import { Logger } from './logger';

// Optional: disable logging
Logger.setConfig({ enabled: false });

// Fetch and validate
const fetcher = new OrdersFetcher({
  walletAddress: 'BUnGokFzA1wu8vb6adHfyhnNvCxaVt6QyPNmmUNWPwET',
  pageSize: 25
});

const results = await fetcher.execute();
OrdersFetcher.printResults(results);
```

## Testing

```bash
npm test              # Run all tests
npm run test:watch   # Watch mode
```

Test files: `logger.test.ts`, `wallet-filter.test.ts`, `wallet-validator.test.ts` (19+ tests)

## Architecture

Workflow: Fetch Orders → Filter by Wallet → Fetch Details → Validate → Report Results

Key types:
```typescript
interface Order {
  id: string;
  orderId: string;
  takerAddress: string;
  makerAddress: string;
  // ... other fields
}

interface ValidationResult {
  orderId: string;
  isValid: boolean;
  foundInFields: string[];
}
```

Validated fields: `takerAddress`, `makerAddress`, `walletAddress`, `userAddress`, `senderAddress`, `receiverAddress`, `recipient`, `sender`, `owner`, `account`, `from`, `to`, `initiator`, `operator` + custom fields

## Logging

Winston logging (34 logging points across codebase). Enable/disable:

```typescript
Logger.setConfig({ enabled: false });  // Disable
Logger.setConfig({ enabled: true });   // Enable
```

## Error Handling

- Invalid wallets: caught and logged
- API errors: handled gracefully
- Missing details: logged and skipped
- All errors include context

## Requirements

- Node.js 16+, npm 7+
- TypeScript 5.0+

## Scripts

| Command | Action |
|---------|--------|
| `npm install` | Install dependencies |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled app |
| `npm run dev` | Run with ts-node |
| `npm test` | Run tests |

## Tech Stack

**Production:** axios, winston  
**Development:** TypeScript, Jest, ts-jest, ts-node

---

**GitHub**: https://github.com/NeBolvan/TastyTask  
**Status**: ✅ Production Ready | **License**: ISC
