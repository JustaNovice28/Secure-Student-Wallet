import { StyleSheet, Text, View } from "react-native";

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Dashboard — placeholder (built on feature/profile-dashboard)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  text: { fontSize: 14, color: "#64748b", textAlign: "center" },
});
