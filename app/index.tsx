import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SecureInput from "../components/SecureInput";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/business/authService";

/**
 * PRESENTATION LAYER
 * This screen only: (1) collects input, (2) calls the Business
 * Layer (authService / useAuth), (3) renders the result. It never
 * imports SecureStore or AsyncStorage directly.
 */
export default function LoginScreen() {
  const { login } = useAuth();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinAlreadySet, setPinAlreadySet] = useState<boolean | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    authService.isPinSet().then(setPinAlreadySet);
  }, []);

  if (pinAlreadySet === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const handleSetupPin = async () => {
    setError(undefined);
    if (pin !== confirmPin) {
      setError("PINs do not match.");
      return;
    }
    setBusy(true);
    const result = await authService.setPin(pin);
    setBusy(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    setPinAlreadySet(true);
    setPin("");
    setConfirmPin("");
  };

  const handleLogin = async () => {
    setError(undefined);
    setBusy(true);
    const result = await login(pin);
    setBusy(false);
    if (!result.success) {
      setError(result.message);
      setPin("");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Secure Student Wallet</Text>
      <Text style={styles.subtitle}>
        {pinAlreadySet
          ? "Enter your PIN to continue"
          : "Create a 6-digit PIN to secure your wallet"}
      </Text>

      <SecureInput
        value={pin}
        onChangeValue={setPin}
        placeholder="PIN"
        errorMessage={error}
      />

      {!pinAlreadySet && (
        <View style={{ marginTop: 12 }}>
          <SecureInput
            value={confirmPin}
            onChangeValue={setConfirmPin}
            placeholder="Confirm PIN"
          />
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={pinAlreadySet ? handleLogin : handleSetupPin}
        disabled={busy}
      >
        <Text style={styles.buttonText}>
          {busy ? "Please wait…" : pinAlreadySet ? "Unlock" : "Set PIN"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1e293b",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 15,
  },
});
