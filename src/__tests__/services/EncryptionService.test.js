import EncryptionService from '../../services/EncryptionService';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store');

describe('EncryptionService', () => {
  const testKey = 'test-encryption-key';
  const testData = { sensitive: 'data' };
  const stringData = JSON.stringify(testData);

  beforeEach(async () => {
    SecureStore.getItemAsync.mockResolvedValue(testKey);
    await EncryptionService.initialize();
  });

  afterEach(() => {
    jest.clearAllMocks();
    EncryptionService.initialized = false;
    EncryptionService.encryptionKey = null;
  });

  it('initializes correctly', async () => {
    expect(EncryptionService.initialized).toBe(true);
    expect(typeof EncryptionService.encryptionKey).toBe('string');
  });

  it('encrypts and decrypts data correctly', async () => {
    const encrypted = await EncryptionService.encrypt(testData);
    expect(typeof encrypted).toBe('string');
    expect(encrypted.length).toBeGreaterThan(0);

    const decrypted = await EncryptionService.decrypt(encrypted);
    const parsedDecrypted = JSON.parse(decrypted);
    expect(parsedDecrypted).toEqual(testData);
  });

  it('handles initialization errors', async () => {
    EncryptionService.initialized = false;
    SecureStore.getItemAsync.mockRejectedValue(new Error('Storage error'));
    
    await expect(EncryptionService.initialize()).rejects.toThrow();
    expect(EncryptionService.initialized).toBe(false);
  });

  it('handles encryption errors', async () => {
    const invalidData = null;
    
    await expect(EncryptionService.encrypt(invalidData))
      .rejects.toThrow('Invalid data for encryption');
  });

  it('handles decryption errors', async () => {
    const invalidEncryptedData = 'invalid-encrypted-data';
    
    await expect(EncryptionService.decrypt(invalidEncryptedData))
      .rejects.toThrow('Decryption failed');
  });
});
