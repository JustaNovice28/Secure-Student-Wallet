import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

/**
 * SettingItem renders either a toggle row (when onToggle is passed)
 * or a tappable action row (when onPress is passed) — the same
 * component, driven entirely by which props the parent supplies.
 */
export interface SettingItemProps {
  label: string;
  description?: string;
  value?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  destructive?: boolean;
}

export default function SettingItem({
  label,
  description,
  value,
  onToggle,
  onPress,
  destructive,
}: SettingItemProps) {
  const content = (
    <View style={styles.row}>
      <View style={styles.textCol}>
        <Text
          style={[styles.label, destructive ? styles.destructiveText : null]}
        >
          {label}
        </Text>
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
      </View>
      {onToggle ? <Switch value={value} onValueChange={onToggle} /> : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e2e8f0",
  },
  textCol: { flex: 1, paddingRight: 12 },
  label: { fontSize: 15, fontWeight: "600", color: "#1e293b" },
  description: { fontSize: 12, color: "#64748b", marginTop: 2 },
  destructiveText: { color: "#ef4444" },
});
