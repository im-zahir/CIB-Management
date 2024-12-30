import * as SecureStore from 'expo-secure-store';
import CryptoJS from 'crypto-js';

interface EncryptedData {
  data: string;
  iv: string;
  salt: string;
}

class EncryptionService {
  private static instance: EncryptionService;
  private initialized: boolean = false;
  private encryptionKey: string | null = null;
  private readonly keySize: number = 256;
  private readonly iterations: number = 100000;

  private constructor() {}

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  async initialize(): Promise<void> {
    try {
      let key = await SecureStore.getItemAsync('encryption_key');
      if (!key) {
        // Generate a new encryption key if none exists
        key = CryptoJS.lib.WordArray.random(32).toString();
        await SecureStore.setItemAsync('encryption_key', key);
      }
      this.encryptionKey = key;
      this.initialized = true;
    } catch (error) {
      this.initialized = false;
      throw new Error('Failed to initialize encryption service');
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private generateSalt(): string {
    return CryptoJS.lib.WordArray.random(128 / 8).toString();
  }

  private generateIV(): string {
    return CryptoJS.lib.WordArray.random(128 / 8).toString();
  }

  private deriveKey(salt: string): CryptoJS.lib.WordArray {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }
    return CryptoJS.PBKDF2(this.encryptionKey, CryptoJS.enc.Hex.parse(salt), {
      keySize: this.keySize / 32,
      iterations: this.iterations
    });
  }

  async encrypt<T>(data: T): Promise<string> {
    await this.ensureInitialized();

    try {
      if (data === null || data === undefined) {
        throw new Error('Invalid data for encryption');
      }

      const salt = this.generateSalt();
      const iv = this.generateIV();
      const key = this.deriveKey(salt);
      const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);

      const encrypted = CryptoJS.AES.encrypt(jsonStr, key, {
        iv: CryptoJS.enc.Hex.parse(iv),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
      });

      const encryptedData: EncryptedData = {
        data: encrypted.toString(),
        iv,
        salt
      };

      return JSON.stringify(encryptedData);
    } catch (error) {
      throw new Error('Encryption failed');
    }
  }

  async decrypt<T>(encryptedString: string): Promise<T> {
    await this.ensureInitialized();

    try {
      const { data, iv, salt } = JSON.parse(encryptedString) as EncryptedData;
      const key = this.deriveKey(salt);

      const decrypted = CryptoJS.AES.decrypt(data, key, {
        iv: CryptoJS.enc.Hex.parse(iv),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
      });

      const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedStr) {
        throw new Error('Decryption failed');
      }

      return JSON.parse(decryptedStr);
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }

  async encryptFile(fileData: ArrayBuffer): Promise<string> {
    const wordArray = CryptoJS.lib.WordArray.create(fileData);
    return this.encrypt(wordArray.toString());
  }

  async decryptFile(encryptedData: string): Promise<ArrayBuffer> {
    const decryptedStr = await this.decrypt<string>(encryptedData);
    const wordArray = CryptoJS.enc.Hex.parse(decryptedStr);
    return this.wordArrayToArrayBuffer(wordArray);
  }

  private wordArrayToArrayBuffer(wordArray: CryptoJS.lib.WordArray): ArrayBuffer {
    const words = wordArray.words;
    const sigBytes = wordArray.sigBytes;
    const buff = new ArrayBuffer(sigBytes);
    const view = new DataView(buff);

    for (let i = 0; i < sigBytes; i += 4) {
      const word = words[i >>> 2];
      if (word === undefined) break;
      view.setInt32(i, word);
    }

    return buff;
  }

  async generateHash(data: string): Promise<string> {
    return CryptoJS.SHA256(data).toString();
  }

  async compareHash(data: string, hash: string): Promise<boolean> {
    const newHash = await this.generateHash(data);
    return newHash === hash;
  }

  async changeEncryptionKey(newKey: string): Promise<void> {
    await this.ensureInitialized();

    try {
      // Re-encrypt all sensitive data with the new key
      // This would typically involve:
      // 1. Decrypting all data with the old key
      // 2. Storing the new key
      // 3. Re-encrypting all data with the new key
      await SecureStore.setItemAsync('encryption_key', newKey);
      this.encryptionKey = newKey;
    } catch (error) {
      throw new Error('Failed to change encryption key');
    }
  }

  async clearEncryptionKey(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('encryption_key');
      this.encryptionKey = null;
      this.initialized = false;
    } catch (error) {
      throw new Error('Failed to clear encryption key');
    }
  }
}

export const encryptionService = EncryptionService.getInstance();
