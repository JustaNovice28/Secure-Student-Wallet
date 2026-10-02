import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { Accelerometer } from "expo-sensors";
import { useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { hapticsService } from "../../services/business/hapticsService";
import { profileService } from "../../services/business/profileService";

const SHAKE_THRESHOLD = 1.8;

export default function AppTabsLayout() {
  const { logout } = useAuth();
  const lastShake = useRef(0);

  // App-wide Shake to Lock — active across all authenticated tabs
  // and stays enabled across sessions based on the AsyncStorage preference.
  useEffect(() => {
    Accelerometer.setUpdateInterval(250);
    const sub = Accelerometer.addListener(async ({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      if (magnitude > SHAKE_THRESHOLD && now - lastShake.current > 1500) {
        lastShake.current = now;
        const prefs = await profileService.getPreferences();
        if (prefs.shakeToLock) {
          await hapticsService.trigger("medium");
          await logout();
        }
      }
    });
    return () => sub.remove();
  }, [logout]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          borderTopColor: "#e2e8f0",
          backgroundColor: "#ffffff",
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "wallet" : "wallet-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="preferences"
        options={{
          title: "Preferences",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
