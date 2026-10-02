import Ionicons from "@expo/vector-icons/Ionicons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
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

const YEAR_OPTIONS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year",
];

export default function ProfileScreen() {
  const [form, setForm] = useState<StudentProfile>(EMPTY);
  const [errors, setErrors] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [yearPickerVisible, setYearPickerVisible] = useState(false);

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
    const cleaned = data.replace(/[^0-9]/g, "").slice(0, 10);
    update("studentId", cleaned);
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
        placeholder="Enter name (no numbers)"
        value={form.name}
        onChangeText={(v) => {
          const noNumbers = v.replace(/[0-9]/g, "");
          update("name", noNumbers);
        }}
      />

      <Field
        label="Course"
        placeholder="e.g. BSIT"
        value={form.course}
        onChangeText={(v) => update("course", v)}
      />

      <View style={{ marginBottom: 14 }}>
        <Text style={styles.label}>Year level</Text>
        <TouchableOpacity
          style={styles.dropdownTrigger}
          onPress={() => setYearPickerVisible(true)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.dropdownValue,
              !form.year ? styles.dropdownPlaceholder : null,
            ]}
          >
            {form.year || "Select year level"}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#64748b" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={yearPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setYearPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setYearPickerVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Year Level</Text>
            {YEAR_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.modalOption,
                  form.year === option && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  update("year", option);
                  setYearPickerVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    form.year === option && styles.modalOptionTextSelected,
                  ]}
                >
                  {option}
                </Text>
                {form.year === option ? (
                  <Ionicons name="checkmark" size={20} color="#2563eb" />
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.idRow}>
        <View style={{ flex: 1 }}>
          <Field
            label="Student ID (10 digits only)"
            placeholder="e.g. 2024104928"
            keyboardType="number-pad"
            maxLength={10}
            value={form.studentId}
            onChangeText={(v) => {
              const digitsOnly = v.replace(/[^0-9]/g, "").slice(0, 10);
              update("studentId", digitsOnly);
            }}
          />
        </View>
        <TouchableOpacity style={styles.scanBtn} onPress={openScanner}>
          <Text style={styles.scanBtnText}>Scan QR</Text>
        </TouchableOpacity>
      </View>

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
  placeholder,
  keyboardType = "default",
  maxLength,
  onChangeText,
}: {
  label: string;
  value: string;
  placeholder?: string;
  keyboardType?: "default" | "number-pad";
  maxLength?: number;
  onChangeText: (v: string) => void;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        keyboardType={keyboardType}
        maxLength={maxLength}
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
    color: "#1e293b",
    fontSize: 15,
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownValue: {
    fontSize: 15,
    color: "#1e293b",
  },
  dropdownPlaceholder: {
    color: "#94a3b8",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 360,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 14,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e2e8f0",
  },
  modalOptionSelected: {
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  modalOptionText: {
    fontSize: 15,
    color: "#334155",
  },
  modalOptionTextSelected: {
    color: "#2563eb",
    fontWeight: "700",
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
