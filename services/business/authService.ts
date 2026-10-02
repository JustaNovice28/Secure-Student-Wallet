import * as Crypto from "expo-crypto";
import { secureStorageService } from "../data/secureStorageService";

/**
 * BUSINESS LAYER — Auth
 *
 * Sits between the Presentation Layer (Login/PIN screen) and the
 * Data Layer (SecureStore). Owns the RULES:
 *   - PIN format validation
 *   - Hashing (SecureStore never sees a raw PIN)
 *   - Deciding what counts as "authenticated"
 *
 * The screen never talks to SecureStore directly — it calls this
 * service, which is what makes the layers swappable/testable.
 */

const PIN_LENGTH = 6;

function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}

export const authService = {
  validatePinFormat(pin: string): { valid: boolean; message?: string } {
    if (pin.length !== PIN_LENGTH) {
      return { valid: false, message: `PIN must be ${PIN_LENGTH} digits.` };
    }
    if (!/^\d+$/.test(pin)) {
      return { valid: false, message: "PIN must contain digits only." };
    }
    return { valid: true };
  },

  async isPinSet(): Promise<boolean> {
    return secureStorageService.hasPinSet();
  },

  async setPin(pin: string): Promise<{ success: boolean; message?: string }> {
    const format = this.validatePinFormat(pin);
    if (!format.valid) return { success: false, message: format.message };

    const hash = await hashPin(pin);
    await secureStorageService.savePinHash(hash);
    return { success: true };
  },

  async verifyPin(pin: string): Promise<boolean> {
    const storedHash = await secureStorageService.getPinHash();
    if (!storedHash) return false;
    const attemptHash = await hashPin(pin);
    return attemptHash === storedHash;
  },

  // Simulates issuing a session token after successful PIN verification.
  // In a real backend-connected app this would come from a networking
  // call (POST /login) — swap the body of this function without
  // touching the Presentation Layer.
  async login(pin: string): Promise<{ success: boolean; message?: string }> {
    const valid = await this.verifyPin(pin);
    if (!valid) return { success: false, message: "Incorrect PIN." };

    const token = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${pin}:${Date.now()}`,
    );
    await secureStorageService.saveAuthToken(token);
    return { success: true };
  },

  async logout(): Promise<void> {
    // Logout only clears the session token — the PIN itself stays,
    // so the user can log back in. Contrast with clearSensitiveData().
    await secureStorageService.saveAuthToken("");
  },

  async isSessionActive(): Promise<boolean> {
    const token = await secureStorageService.getAuthToken();
    return !!token;
  },

  async clearSensitiveData(): Promise<void> {
    // Full wipe: PIN + token. Used by the "Clear sensitive information"
    // feature, distinct from ordinary logout.
    await secureStorageService.clearAllSensitive();
  },
};
