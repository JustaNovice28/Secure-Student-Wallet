import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

/**
 * SecureInput demonstrates component communication via a callback
 * prop (onChangeValue) — the child never touches storage or parent
 * state directly, it just reports value changes upward.
 */
export interface SecureInputProps {
  value: string;
  onChangeValue: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  errorMessage?: string;
}

export default function SecureInput({
  value,
  onChangeValue,
  placeholder = "Enter PIN",
  maxLength = 6,
  errorMessage,
}: SecureInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.row, errorMessage ? styles.rowError : null]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeValue}
          placeholder={placeholder}
          keyboardType="number-pad"
          secureTextEntry={!visible}
          maxLength={maxLength}
        />
        <TouchableOpacity onPress={() => setVisible((v) => !v)}>
          <Text style={styles.toggle}>{visible ? "Hide" : "Show"}</Text>
        </TouchableOpacity>
      </View>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "100%" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  rowError: { borderColor: "#ef4444" },
  input: { flex: 1, paddingVertical: 12, fontSize: 18, letterSpacing: 4 },
  toggle: { color: "#2563eb", fontWeight: "600", paddingLeft: 8 },
  error: { color: "#ef4444", fontSize: 12, marginTop: 4 },
});
