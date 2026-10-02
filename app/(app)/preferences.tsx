import { useRouter } from "expo-router";
import { Accelerometer } from "expo-sensors";
import { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import SettingItem from "../../components/SettingItem";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/business/authService";
import { profileService } from "../../services/business/profileService";
import { AppPreferences } from "../../types";

const SHAKE_THRESHOLD = 1.8;

export default function PreferencesScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [prefs, setPrefs] = useState<AppPreferences | null>(null);
  const [shakeToLock, setShakeToLock] = useState(false);
  const lastShake = useRef(0);

  useEffect(() => {
    profileService.getPreferences().then(setPrefs);
  }, []);

  // SENSORS: accelerometer-based "shake to lock" — an optional
  // convenience feature layered on top of the required PIN lock.
  useEffect(() => {
    if (!shakeToLock) return;

    Accelerometer.setUpdateInterval(200);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      if (magnitude > SHAKE_THRESHOLD && now - lastShake.current > 1500) {
        lastShake.current = now;
        logout();
      }
    });
    return () => sub.remove();
  }, [shakeToLock]);

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
        label="Dark mode"
        description="Non-sensitive display preference"
        value={prefs.darkMode}
        onToggle={(v) => toggle("darkMode", v)}
      />
      <SettingItem
        label="Notifications"
        description="Non-sensitive app setting"
        value={prefs.notificationsEnabled}
        onToggle={(v) => toggle("notificationsEnabled", v)}
      />
      <SettingItem
        label="Shake to lock"
        description="Uses the accelerometer to log you out on a shake"
        value={shakeToLock}
        onToggle={setShakeToLock}
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
