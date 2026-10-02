import { AppPreferences, StudentProfile } from "../../types";
import { asyncStorageService } from "../data/asyncStorageService";

/**
 * BUSINESS LAYER — Profile & Preferences
 *
 * Owns validation rules for non-sensitive data before it ever
 * reaches the Data Layer (AsyncStorage). Screens call this, not
 * asyncStorageService, directly.
 */

export const profileService = {
  validateProfile(profile: StudentProfile): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    if (!profile.name.trim()) errors.push("Name is required.");
    if (!profile.studentId.trim()) errors.push("Student ID is required.");
    if (!profile.course.trim()) errors.push("Course is required.");
    if (!profile.year.trim()) errors.push("Year level is required.");
    return { valid: errors.length === 0, errors };
  },

  async saveProfile(
    profile: StudentProfile,
  ): Promise<{ success: boolean; errors?: string[] }> {
    const { valid, errors } = this.validateProfile(profile);
    if (!valid) return { success: false, errors };
    await asyncStorageService.saveProfile(profile);
    return { success: true };
  },

  async getProfile(): Promise<StudentProfile | null> {
    return asyncStorageService.getProfile();
  },

  async deleteProfile(): Promise<void> {
    await asyncStorageService.deleteProfile();
  },

  async getPreferences(): Promise<AppPreferences> {
    return asyncStorageService.getPreferences();
  },

  async updatePreferences(
    partial: Partial<AppPreferences>,
  ): Promise<AppPreferences> {
    const current = await asyncStorageService.getPreferences();
    const updated = { ...current, ...partial };
    await asyncStorageService.savePreferences(updated);
    return updated;
  },
};
