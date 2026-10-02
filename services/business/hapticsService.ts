import * as Haptics from "expo-haptics";
import { asyncStorageService } from "../data/asyncStorageService";

/**
 * BUSINESS / HARDWARE SERVICE — Haptic Feedback
 *
 * Encapsulates tactile feedback calls and checks the user's
 * non-sensitive preferences (stored in AsyncStorage) before firing.
 * If the user has disabled haptic feedback, or if running in an
 * environment without vibration hardware (web/simulator), it safely no-ops.
 */
export const hapticsService = {
  async trigger(
    type:
      | "light"
      | "medium"
      | "heavy"
      | "success"
      | "error"
      | "selection" = "light",
  ): Promise<void> {
    try {
      const prefs = await asyncStorageService.getPreferences();
      if (!prefs.hapticFeedback) return;

      switch (type) {
        case "light":
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case "medium":
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case "heavy":
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case "success":
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
          break;
        case "error":
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error,
          );
          break;
        case "selection":
          await Haptics.selectionAsync();
          break;
      }
    } catch {
      // Gracefully no-op on platforms or emulators without haptic motors
    }
  },
};
