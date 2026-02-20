import WalletFilter from '../wallet-filter';
import { Order } from '../types';
import { Logger } from '../logger';

describe('WalletFilter', () => {
  const testWallet = 'BUnGokFzA1wu8vb6adHfyhnNvCxaVt6QyPNmmUNWPwET';

  beforeEach(() => {
    Logger.setConfig({ enabled: false });
  });

  test('should throw error for empty wallet address', () => {
    expect(() => new WalletFilter('')).toThrow('Invalid wallet address');
    expect(() => new WalletFilter('   ')).toThrow('Invalid wallet address');
  });

  test('should initialize with valid wallet address', () => {
    const filter = new WalletFilter(testWallet);
    expect(filter.getWalletAddress()).toBe(testWallet.toLowerCase());
  });

  test('should handle case-insensitive wallet addresses', () => {
    const filter = new WalletFilter(testWallet.toUpperCase());
    expect(filter.getWalletAddress()).toBe(testWallet.toLowerCase());
  });

  test('should detect wallet in takerAddress field', () => {
    const filter = new WalletFilter(testWallet);
    const order: Order = {
      id: '1',
      orderId: 'order-1',
      chainId: 1,
      takerAddress: testWallet,
      makerAddress: 'other-address',
      status: 'pending',
      filledAmount: '0',
      unfilledAmount: '100'
    };

    expect(filter.isWalletInOrder(order)).toBe(true);
  });

  test('should detect wallet in makerAddress field', () => {
    const filter = new WalletFilter(testWallet);
    const order: Order = {
      id: '1',
      orderId: 'order-1',
      chainId: 1,
      takerAddress: 'other-address',
      makerAddress: testWallet,
      status: 'pending',
      filledAmount: '0',
      unfilledAmount: '100'
    };

    expect(filter.isWalletInOrder(order)).toBe(true);
  });

  test('should return false when wallet not in order', () => {
    const filter = new WalletFilter(testWallet);
    const order: Order = {
      id: '1',
      orderId: 'order-1',
      chainId: 1,
      takerAddress: 'address-1',
      makerAddress: 'address-2',
      status: 'pending',
      filledAmount: '0',
      unfilledAmount: '100'
    };

    expect(filter.isWalletInOrder(order)).toBe(false);
  });

  test('should filter orders correctly', () => {
    const filter = new WalletFilter(testWallet);
    const orders: Order[] = [
      {
        id: '1',
        orderId: 'order-1',
        chainId: 1,
        takerAddress: testWallet,
        makerAddress: 'addr-2',
        status: 'pending',
        filledAmount: '0',
        unfilledAmount: '100'
      },
      {
        id: '2',
        orderId: 'order-2',
        chainId: 1,
        takerAddress: 'addr-3',
        makerAddress: 'addr-4',
        status: 'pending',
        filledAmount: '0',
        unfilledAmount: '100'
      },
      {
        id: '3',
        orderId: 'order-3',
        chainId: 1,
        takerAddress: 'addr-5',
        makerAddress: testWallet,
        status: 'pending',
        filledAmount: '0',
        unfilledAmount: '100'
      }
    ];

    const filtered = filter.filterOrders(orders);
    expect(filtered).toHaveLength(2);
    expect(filtered[0].orderId).toBe('order-1');
    expect(filtered[1].orderId).toBe('order-3');
  });

  test('should handle case-insensitive filtering', () => {
    const filter = new WalletFilter(testWallet);
    const order: Order = {
      id: '1',
      orderId: 'order-1',
      chainId: 1,
      takerAddress: testWallet.toUpperCase(),
      makerAddress: 'addr-2',
      status: 'pending',
      filledAmount: '0',
      unfilledAmount: '100'
    };

    expect(filter.isWalletInOrder(order)).toBe(true);
  });
});
