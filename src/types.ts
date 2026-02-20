export interface Order {
  id: string;
  orderId: string;
  chainId: number;
  takerAddress: string;
  makerAddress: string;
  status: string;
  filledAmount: string;
  unfilledAmount: string;
  [key: string]: unknown;
}

export interface OrdersListResponse {
  orders: Order[];
  pagination?: {
    page: number;
    perPage: number;
    total: number;
  };
}

export interface OrderDetails {
  id: string;
  orderId: string;
  chainId: number;
  takerAddress: string;
  makerAddress: string;
  takerTokenAddress?: string;
  makerTokenAddress?: string;
  takerTokenAmount?: string;
  makerTokenAmount?: string;
  receiver?: string;
  status: string;
  filledAmount: string;
  unfilledAmount: string;
  [key: string]: unknown;
}

export interface ValidationResult {
  orderId: string;
  isValid: boolean;
  foundInFields: string[];
  details: OrderDetails;
}

export interface WalletFilterOptions {
  walletAddress: string;
  pageSize: number;
  maxPages?: number;
}

export interface FetcherOptions extends WalletFilterOptions {
  loggingEnabled?: boolean;
}
