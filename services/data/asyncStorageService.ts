import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppPreferences, StudentProfile } from "../../types";

/**
 * DATA LAYER — AsyncStorage
 *
 * WHY AsyncStorage here:
 * AsyncStorage is unencrypted, key-value storage backed by the OS's
 * plain storage APIs (SharedPreferences on Android, a plist-backed
 * store on iOS). It is fast and has no size ceremony, but anything
 * written here is recoverable by anyone with file-system access to
 * the device (e.g. a rooted phone, or a backup extraction tool).
 *
 * That makes it the right place for data that is:
 *   - Not secret if exposed (profile name, course, year)
 *   - Convenience/config data (theme, language, notification toggle)
 *   - Safely re-fetchable/re-derivable (a cache)
 *
 * It must NEVER be used for the PIN, password, or auth token —
 * see secureStorageService.ts for that boundary.
 */

const KEYS = {
  PROFILE: "@wallet/profile",
  PREFERENCES: "@wallet/preferences",
  CACHE_PREFIX: "@wallet/cache/",
} as const;

const DEFAULT_PREFERENCES: AppPreferences = {
  maskStudentId: true,
  hapticFeedback: true,
  shakeToLock: false,
  language: "en",
};

export const asyncStorageService = {
  async saveProfile(profile: StudentProfile): Promise<void> {
    await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  async getProfile(): Promise<StudentProfile | null> {
    const raw = await AsyncStorage.getItem(KEYS.PROFILE);
    return raw ? (JSON.parse(raw) as StudentProfile) : null;
  },

  async deleteProfile(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.PROFILE);
  },

  async savePreferences(prefs: AppPreferences): Promise<void> {
    await AsyncStorage.setItem(KEYS.PREFERENCES, JSON.stringify(prefs));
  },

  async getPreferences(): Promise<AppPreferences> {
    const raw = await AsyncStorage.getItem(KEYS.PREFERENCES);
    return raw ? (JSON.parse(raw) as AppPreferences) : DEFAULT_PREFERENCES;
  },

  async setCache<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(KEYS.CACHE_PREFIX + key, JSON.stringify(value));
  },

  async getCache<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(KEYS.CACHE_PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  },

  async clearAll(): Promise<void> {
    const allKeys = await AsyncStorage.getAllKeys();
    const ownKeys = allKeys.filter(
      (k) =>
        k === KEYS.PROFILE ||
        k === KEYS.PREFERENCES ||
        k.startsWith(KEYS.CACHE_PREFIX),
    );
    await AsyncStorage.multiRemove(ownKeys);
  },
};
