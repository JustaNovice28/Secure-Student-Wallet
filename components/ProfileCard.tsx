import { Image, StyleSheet, Text, View } from "react-native";

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * COMPONENTS & PROPS
 *
 * ProfileCard is a pure presentational component: it receives data
 * via props and renders it. It holds no state of its own and knows
 * nothing about AsyncStorage/SecureStore — that separation is what
 * makes it reusable on the Dashboard, Profile screen, etc.
 */
export interface ProfileCardProps {
  name: string;
  course: string;
  year: string;
  studentId: string;
  avatarUri?: string;
}

export default function ProfileCard({
  name,
  course,
  year,
  studentId,
  avatarUri,
}: ProfileCardProps) {
  return (
    <View style={styles.card}>
      {avatarUri ? (
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.avatarInitials}>{initialsOf(name) || "?"}</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.meta}>
          {course} • {year}
        </Text>
        <Text style={styles.id}>ID: {studentId}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    backgroundColor: "#e2e8f0",
  },
  avatarFallback: { justifyContent: "center", alignItems: "center" },
  avatarInitials: { fontWeight: "700", color: "#475569" },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "700", color: "#1e293b" },
  meta: { fontSize: 13, color: "#64748b", marginTop: 2 },
  id: { fontSize: 12, color: "#94a3b8", marginTop: 4 },
});
