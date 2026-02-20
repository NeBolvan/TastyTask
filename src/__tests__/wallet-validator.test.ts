import WalletValidator from '../wallet-validator';
import { OrderDetails, ValidationResult } from '../types';
import { Logger } from '../logger';

describe('WalletValidator', () => {
  const testWallet = 'BUnGokFzA1wu8vb6adHfyhnNvCxaVt6QyPNmmUNWPwET';

  beforeEach(() => {
    Logger.setConfig({ enabled: false });
  });

  test('should throw error for empty wallet address', () => {
    expect(() => new WalletValidator('')).toThrow('Invalid wallet address');
  });

  test('should initialize with valid wallet address', () => {
    const validator = new WalletValidator(testWallet);
    expect(validator.getWalletAddress()).toBe(testWallet.toLowerCase());
  });

  test('should validate order with wallet in takerAddress', () => {
    const validator = new WalletValidator(testWallet);
    const orderDetails: OrderDetails = {
      id: '1',
      orderId: 'order-1',
      chainId: 1,
      takerAddress: testWallet,
      makerAddress: 'other-addr',
      status: 'pending',
      filledAmount: '0',
      unfilledAmount: '100'
    };

    const result = validator.validate(orderDetails);
    expect(result.isValid).toBe(true);
    expect(result.foundInFields).toContain('takerAddress');
  });

  test('should validate order with wallet in makerAddress', () => {
    const validator = new WalletValidator(testWallet);
    const orderDetails: OrderDetails = {
      id: '1',
      orderId: 'order-1',
      chainId: 1,
      takerAddress: 'other-addr',
      makerAddress: testWallet,
      status: 'pending',
      filledAmount: '0',
      unfilledAmount: '100'
    };

    const result = validator.validate(orderDetails);
    expect(result.isValid).toBe(true);
    expect(result.foundInFields).toContain('makerAddress');
  });

  test('should find wallet in multiple fields', () => {
    const validator = new WalletValidator(testWallet);
    const orderDetails: OrderDetails = {
      id: '1',
      orderId: 'order-1',
      chainId: 1,
      takerAddress: testWallet,
      makerAddress: testWallet,
      receiver: testWallet,
      status: 'pending',
      filledAmount: '0',
      unfilledAmount: '100'
    };

    const result = validator.validate(orderDetails);
    expect(result.isValid).toBe(true);
    expect(result.foundInFields.length).toBeGreaterThan(1);
    expect(result.foundInFields).toContain('takerAddress');
    expect(result.foundInFields).toContain('makerAddress');
  });

  test('should fail validation when wallet not found', () => {
    const validator = new WalletValidator(testWallet);
    const orderDetails: OrderDetails = {
      id: '1',
      orderId: 'order-1',
      chainId: 1,
      takerAddress: 'addr-1',
      makerAddress: 'addr-2',
      status: 'pending',
      filledAmount: '0',
      unfilledAmount: '100'
    };

    const result = validator.validate(orderDetails);
    expect(result.isValid).toBe(false);
    expect(result.foundInFields).toHaveLength(0);
  });

  test('should handle case-insensitive validation', () => {
    const validator = new WalletValidator(testWallet);
    const orderDetails: OrderDetails = {
      id: '1',
      orderId: 'order-1',
      chainId: 1,
      takerAddress: testWallet.toUpperCase(),
      makerAddress: 'addr-2',
      status: 'pending',
      filledAmount: '0',
      unfilledAmount: '100'
    };

    const result = validator.validate(orderDetails);
    expect(result.isValid).toBe(true);
    expect(result.foundInFields).toContain('takerAddress');
  });

  test('should check all default fields', () => {
    const validator = new WalletValidator(testWallet);
    const orderDetails: OrderDetails = {
      id: '1',
      orderId: 'order-1',
      chainId: 1,
      takerAddress: 'addr-1',
      makerAddress: 'addr-2',
      recipient: testWallet,
      status: 'pending',
      filledAmount: '0',
      unfilledAmount: '100'
    };

    const result = validator.validate(orderDetails);
    expect(result.isValid).toBe(true);
    expect(result.foundInFields).toContain('recipient');
  });

  test('should validate multiple orders', () => {
    const validator = new WalletValidator(testWallet);
    const ordersDetails: OrderDetails[] = [
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
      }
    ];

    const results = validator.validateMultiple(ordersDetails);
    expect(results).toHaveLength(2);
    expect(results[0].isValid).toBe(true);
    expect(results[1].isValid).toBe(false);
  });

  test('should include validation details in result', () => {
    const validator = new WalletValidator(testWallet);
    const orderDetails: OrderDetails = {
      id: 'order-id-123',
      orderId: 'order-1',
      chainId: 1,
      takerAddress: testWallet,
      makerAddress: 'addr-2',
      status: 'pending',
      filledAmount: '50',
      unfilledAmount: '50'
    };

    const result = validator.validate(orderDetails);
    expect(result.details).toEqual(orderDetails);
    expect(result.orderId).toBeDefined();
  });

  test('should find wallet in custom fields', () => {
    const validator = new WalletValidator(testWallet);
    const orderDetails: OrderDetails = {
      id: '1',
      orderId: 'order-1',
      chainId: 1,
      takerAddress: 'addr-1',
      makerAddress: 'addr-2',
      customField: testWallet,
      status: 'pending',
      filledAmount: '0',
      unfilledAmount: '100'
    };

    const result = validator.validate(orderDetails);
    expect(result.isValid).toBe(true);
    expect(result.foundInFields).toContain('customField');
  });
});
