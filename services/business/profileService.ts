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

    // Name: letters, spaces, hyphens, apostrophes only — no numbers
    if (!profile.name.trim()) {
      errors.push("Name is required.");
    } else if (/\d/.test(profile.name)) {
      errors.push("Name cannot contain numbers.");
    } else if (!/^[A-Za-z\s.\-']+$/.test(profile.name.trim())) {
      errors.push("Name can only contain letters, spaces, and hyphens.");
    }

    // Student ID: exactly 10 digits, only integers
    if (!profile.studentId.trim()) {
      errors.push("Student ID is required.");
    } else if (!/^\d{10}$/.test(profile.studentId.trim())) {
      errors.push("Student ID must be exactly 10 digits (numbers only).");
    }

    // Course
    if (!profile.course.trim()) {
      errors.push("Course is required.");
    }

    // Year level: dropdown from 1st Year to 5th Year
    const VALID_YEARS = [
      "1st Year",
      "2nd Year",
      "3rd Year",
      "4th Year",
      "5th Year",
    ];
    if (!profile.year.trim()) {
      errors.push("Year level is required.");
    } else if (!VALID_YEARS.includes(profile.year)) {
      errors.push("Year level must be from 1st Year to 5th Year.");
    }

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
