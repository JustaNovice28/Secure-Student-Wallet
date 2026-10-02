import * as SecureStore from "expo-secure-store";

/**
 * DATA LAYER — SecureStore
 *
 * WHY SecureStore here:
 * expo-secure-store is backed by the Keychain on iOS and the
 * Keystore-backed EncryptedSharedPreferences on Android. Values are
 * encrypted at rest with keys the OS manages, and are not readable
 * by simply pulling the app's storage files off the device.
 *
 * That makes it the right (and only acceptable) place for:
 *   - The user's PIN (stored as a hash, never plaintext)
 *   - The session/auth token
 *   - Any other credential-like secret
 *
 * Trade-offs vs AsyncStorage: smaller size limit (~2KB per value on
 * some platforms), slightly slower reads/writes, and it's overkill
 * (and unnecessary) for non-secret data like a display name.
 */

const KEYS = {
  PIN_HASH: "wallet_pin_hash",
  AUTH_TOKEN: "wallet_auth_token",
} as const;

export const secureStorageService = {
  async savePinHash(pinHash: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.PIN_HASH, pinHash);
  },

  async getPinHash(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.PIN_HASH);
  },

  async hasPinSet(): Promise<boolean> {
    const hash = await SecureStore.getItemAsync(KEYS.PIN_HASH);
    return hash !== null;
  },

  async saveAuthToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.AUTH_TOKEN, token);
  },

  async getAuthToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.AUTH_TOKEN);
  },

  // "Clear sensitive information" screen calls this directly.
  // This is deliberately separate from asyncStorageService.clearAll()
  // so the two storage boundaries stay explicit in the codebase.
  async clearAllSensitive(): Promise<void> {
    await SecureStore.deleteItemAsync(KEYS.PIN_HASH);
    await SecureStore.deleteItemAsync(KEYS.AUTH_TOKEN);
  },
};
