// app/scan.tsx (Scan screen)
import { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { CameraView, Camera } from "expo-camera";
import { verifyByQr } from "../src/lib/api";
import { addHistory } from "../src/lib/storage";

export default function ScanScreen() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannedOnceRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const { granted } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(!!granted);
      } catch (e) {
        setHasPermission(false);
      }
    })();
  }, []);

  const onScan = useCallback(async (payload: { data: string; type: string }) => {
    if (scanning || scannedOnceRef.current) return;
    // Process only real QR codes
    if (payload.type !== "qr") return;

    setScanning(true);
    scannedOnceRef.current = true;

    try {
      // Accept either raw ids or deep links .../verify/{id}
      const match = payload.data.match(/\/verify\/([^/?#]+)/);
      const qrCodeId = match ? match[1] : payload.data;

      const resp = await verifyByQr(qrCodeId);
      await addHistory({ ...resp, qrCodeId });
      
      // Include qrCodeId in the payload for violation reporting
      const payloadWithQrId = { ...resp, qrCodeId };
      router.push({ pathname: "/result", params: { payload: JSON.stringify(payloadWithQrId) } });
    } catch (e: any) {
      Alert.alert("Verification failed", e?.response?.data?.message ?? "Invalid or unreachable code.");
      // Enable re-scan after error
      scannedOnceRef.current = false;
    } finally {
      setScanning(false);
    }
  }, [scanning, router]);

  if (hasPermission === null) {
    return <View style={styles.center}><ActivityIndicator /><Text>Requesting camera permission…</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.center}><Text>No access to camera.</Text></View>;
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        onBarcodeScanned={onScan}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        style={{ flex: 1 }}
      />
      <View style={styles.overlay}>
        <View style={styles.overlayButtons}>
          <TouchableOpacity style={styles.btn} onPress={() => router.push("/history")}>
            <Text style={styles.btnText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={() => router.push("/settings")}>
            <Text style={styles.btnText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  overlay: { position: "absolute", bottom: 24, width: "100%", alignItems: "center" },
  overlayButtons: { flexDirection: "row", gap: 12 },
  btn: { backgroundColor: "black", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, opacity: 0.85 },
  btnText: { color: "white", fontWeight: "600" }
});

