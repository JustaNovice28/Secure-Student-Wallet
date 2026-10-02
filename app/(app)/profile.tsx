import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { profileService } from "../../services/business/profileService";
import { StudentProfile } from "../../types";

const EMPTY: StudentProfile = { name: "", course: "", year: "", studentId: "" };

export default function ProfileScreen() {
  const [form, setForm] = useState<StudentProfile>(EMPTY);
  const [errors, setErrors] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  useEffect(() => {
    profileService.getProfile().then((p) => p && setForm(p));
  }, []);

  const update = <K extends keyof StudentProfile>(
    key: K,
    value: StudentProfile[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    const result = await profileService.saveProfile(form);
    if (!result.success) {
      setErrors(result.errors ?? []);
      return;
    }
    setErrors([]);
    Alert.alert("Saved", "Profile information saved.");
  };

  const handleDelete = () => {
    Alert.alert("Delete profile?", "This removes your saved profile info.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await profileService.deleteProfile();
          setForm(EMPTY);
        },
      },
    ]);
  };

  const openScanner = async () => {
    if (!cameraPermission?.granted) {
      const res = await requestCameraPermission();
      if (!res.granted) {
        Alert.alert(
          "Camera permission needed",
          "Enable camera access to scan a student ID QR code.",
        );
        return;
      }
    }
    setScanning(true);
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScanning(false);
    update("studentId", data);
  };

  const tagLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Location permission needed",
        "Enable location to tag where this info was verified.",
      );
      return;
    }
    const position = await Location.getCurrentPositionAsync({});
    update("lastVerifiedLocation", {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: Date.now(),
    });
    Alert.alert(
      "Location tagged",
      "Verification location saved with your profile.",
    );
  };

  if (scanning) {
    return (
      <View style={{ flex: 1 }}>
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={handleBarcodeScanned}
        />
        <TouchableOpacity
          style={styles.cancelScan}
          onPress={() => setScanning(false)}
        >
          <Text style={styles.cancelScanText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text style={styles.title}>Profile Information</Text>

      {errors.length > 0 && (
        <View style={styles.errorBox}>
          {errors.map((e) => (
            <Text key={e} style={styles.errorText}>
              • {e}
            </Text>
          ))}
        </View>
      )}

      <Field
        label="Full name"
        value={form.name}
        onChangeText={(v) => update("name", v)}
      />
      <Field
        label="Course"
        value={form.course}
        onChangeText={(v) => update("course", v)}
      />
      <Field
        label="Year level"
        value={form.year}
        onChangeText={(v) => update("year", v)}
      />

      <View style={styles.idRow}>
        <View style={{ flex: 1 }}>
          <Field
            label="Student ID"
            value={form.studentId}
            onChangeText={(v) => update("studentId", v)}
          />
        </View>
        <TouchableOpacity style={styles.scanBtn} onPress={openScanner}>
          <Text style={styles.scanBtnText}>Scan QR</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.secondaryBtn} onPress={tagLocation}>
        <Text style={styles.secondaryBtnText}>
          {form.lastVerifiedLocation
            ? "Re-verify location"
            : "Tag verification location (GPS)"}
        </Text>
      </TouchableOpacity>
      {form.lastVerifiedLocation && (
        <Text style={styles.locationNote}>
          Last verified at {form.lastVerifiedLocation.latitude.toFixed(4)},{" "}
          {form.lastVerifiedLocation.longitude.toFixed(4)}
        </Text>
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteBtnText}>Delete profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 16,
  },
  label: { fontSize: 13, color: "#64748b", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  idRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  scanBtn: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 8,
    marginBottom: 14,
  },
  scanBtnText: { fontWeight: "600", color: "#334155" },
  cancelScan: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
  },
  cancelScanText: { fontWeight: "700" },
  secondaryBtn: {
    backgroundColor: "#e0f2fe",
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 4,
  },
  secondaryBtnText: {
    textAlign: "center",
    color: "#0369a1",
    fontWeight: "600",
  },
  locationNote: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 6,
    textAlign: "center",
  },
  saveBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 20,
  },
  saveBtnText: { color: "#fff", textAlign: "center", fontWeight: "700" },
  deleteBtn: { paddingVertical: 14, marginTop: 8 },
  deleteBtnText: { color: "#ef4444", textAlign: "center", fontWeight: "600" },
  errorBox: {
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  errorText: { color: "#991b1b", fontSize: 13 },
});
