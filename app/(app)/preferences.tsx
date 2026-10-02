import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import SettingItem from "../../components/SettingItem";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/business/authService";
import { hapticsService } from "../../services/business/hapticsService";
import { profileService } from "../../services/business/profileService";
import { AppPreferences } from "../../types";

export default function PreferencesScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [prefs, setPrefs] = useState<AppPreferences | null>(null);

  useEffect(() => {
    profileService.getPreferences().then(setPrefs);
  }, []);

  if (!prefs) return null;

  const toggle = async (key: keyof AppPreferences, value: boolean) => {
    const updated = await profileService.updatePreferences({
      [key]: value,
    } as Partial<AppPreferences>);
    setPrefs(updated);
  };

  const handleClearSensitive = () => {
    Alert.alert(
      "Clear sensitive information?",
      "This deletes your PIN and session token. You will need to set a new PIN to use the app again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await authService.clearSensitiveData();
            router.replace("/");
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text style={styles.title}>Preferences</Text>

      <Text style={styles.sectionLabel}>General (stored in AsyncStorage)</Text>
      <SettingItem
        label="Mask Student ID"
        description="Conceals ID on dashboard cards to prevent shoulder-surfing"
        value={prefs.maskStudentId}
        onToggle={(v) => toggle("maskStudentId", v)}
      />
      <SettingItem
        label="Haptic Feedback"
        description="Tactile vibration on PIN taps, buttons, and security actions"
        value={prefs.hapticFeedback}
        onToggle={async (v) => {
          await toggle("hapticFeedback", v);
          if (v) hapticsService.trigger("light");
        }}
      />
      <SettingItem
        label="Shake to lock"
        description="Uses the accelerometer to log you out on a shake"
        value={prefs.shakeToLock}
        onToggle={async (v) => {
          await toggle("shakeToLock", v);
          if (v) hapticsService.trigger("light");
        }}
      />

      <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
        Account (touches SecureStore)
      </Text>
      <SettingItem label="Logout" onPress={logout} />
      <SettingItem
        label="Clear sensitive information"
        description="Deletes PIN + session token from SecureStore"
        destructive
        onPress={handleClearSensitive}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    marginBottom: 4,
  },
});
