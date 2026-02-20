import { Logger } from '../logger';
import { LoggerConfig } from '../logger';

describe('Logger', () => {
  let originalConfig: LoggerConfig;

  beforeEach(() => {
    originalConfig = Logger.getConfig();
  });

  afterEach(() => {
    Logger.setConfig(originalConfig);
  });

  test('should initialize with default config', () => {
    const config = Logger.getConfig();
    expect(config.enabled).toBe(true);
  });

  test('should disable logging when config.enabled is false', () => {
    Logger.setConfig({ enabled: false });
    const config = Logger.getConfig();
    expect(config.enabled).toBe(false);
  });

  test('should enable logging when config.enabled is true', () => {
    Logger.setConfig({ enabled: true });
    const config = Logger.getConfig();
    expect(config.enabled).toBe(true);
  });

  test('should log messages when enabled', () => {
    Logger.setConfig({ enabled: true });
    
    // Should not throw
    expect(() => {
      Logger.info('Test message', { key: 'value' });
      Logger.error('Error message', new Error('Test error'));
      Logger.warn('Warning message');
      Logger.debug('Debug message');
    }).not.toThrow();
  });

  test('should not log messages when disabled', () => {
    Logger.setConfig({ enabled: false });
    
    // Should not throw
    expect(() => {
      Logger.info('Test message');
      Logger.error('Error message', new Error('Test error'));
    }).not.toThrow();
  });
});
