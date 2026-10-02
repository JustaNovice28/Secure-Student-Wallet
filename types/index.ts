/**
 * DATA LAYER TYPES
 * These describe the shape of data moving between the Data Layer
 * (storage services) and the Business Layer (services) and up to
 * the Presentation Layer (screens/components).
 */

// Non-sensitive profile info -> AsyncStorage
export interface StudentProfile {
  name: string;
  course: string;
  year: string;
  studentId: string;
  avatarUri?: string;
}

// Non-sensitive app preferences -> AsyncStorage
export interface AppPreferences {
  maskStudentId: boolean;
  hapticFeedback: boolean;
  shakeToLock: boolean;
  language: "en" | "fil";
}

// Sensitive auth data -> SecureStore
export interface AuthCredentials {
  pinHash: string; // never store the raw PIN, only a hash
  authToken: string;
}

export interface SessionState {
  isAuthenticated: boolean;
  isLoading: boolean;
}
