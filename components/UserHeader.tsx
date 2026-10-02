import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface UserHeaderProps {
  name: string;
  subtitle?: string;
  onLogout?: () => void;
}

export default function UserHeader({
  name,
  subtitle,
  onLogout,
}: UserHeaderProps) {
  const firstName = name.split(" ")[0] || name;
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.greeting}>Hi, {firstName} 👋</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {onLogout ? (
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  greeting: { fontSize: 20, fontWeight: "700", color: "#1e293b" },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 2 },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#fee2e2",
  },
  logoutText: { color: "#dc2626", fontWeight: "600", fontSize: 13 },
});
