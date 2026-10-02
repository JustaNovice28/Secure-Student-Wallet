import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import ProfileCard from "../../components/ProfileCard";
import UserHeader from "../../components/UserHeader";
import { useAuth } from "../../context/AuthContext";
import { profileService } from "../../services/business/profileService";
import { AppPreferences, StudentProfile } from "../../types";

export default function DashboardScreen() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [prefs, setPrefs] = useState<AppPreferences | null>(null);

  useFocusEffect(
    useCallback(() => {
      profileService.getProfile().then(setProfile);
      profileService.getPreferences().then(setPrefs);
    }, []),
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
    >
      <UserHeader
        name={profile?.name ?? "Student"}
        subtitle="Welcome back"
        onLogout={logout}
      />

      {profile ? (
        <ProfileCard
          name={profile.name}
          course={profile.course}
          year={profile.year}
          studentId={profile.studentId}
          avatarUri={profile.avatarUri}
          maskId={prefs?.maskStudentId}
        />
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No profile saved yet. Go to the Profile tab to add one.
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Architecture note</Text>
      <Text style={styles.note}>
        This screen only reads from profileService (Business Layer). It never
        imports AsyncStorage/SecureStore directly — that boundary is what lets
        the Data Layer change (e.g. swap in a real backend) without touching
        this screen.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  emptyText: { color: "#64748b", textAlign: "center" },
  sectionTitle: { marginTop: 28, fontWeight: "700", color: "#1e293b" },
  note: { marginTop: 6, color: "#64748b", fontSize: 13, lineHeight: 18 },
});
