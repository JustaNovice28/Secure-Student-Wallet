import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";

function RouteGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAppGroup = segments[0] === "(app)";

    if (!isAuthenticated && inAppGroup) {
      router.replace("/");
    } else if (isAuthenticated && !inAppGroup) {
      router.replace("/(app)/dashboard");
    }
  }, [isAuthenticated, isLoading, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <RouteGuard />
    </AuthProvider>
  );
}
