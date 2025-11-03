import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Alert, Modal } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Card } from "../src/components/Card";
import { Button } from "../src/components/Button";
import { colors, spacing } from "../src/theme";
import { useAuth } from "../src/context/auth-context";
import { submitInspection } from "../src/lib/inspections-api";

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [violationType, setViolationType] = useState("");
  const [violationNotes, setViolationNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Parse params - handle both JSON string payload and direct params
  let status: "verified" | "warning" | "invalid" = "invalid";
  let broker: any = undefined;
  let message: string = "";

  if (params.payload) {
    try {
      const parsed = JSON.parse(params.payload as string);
      status = parsed.status || "invalid";
      broker = parsed.broker;
      message = parsed.message || "";
    } catch (e) {
      // If payload parsing fails, fallback to direct params
      status = (params.status as "verified" | "warning" | "invalid") || "invalid";
      if (params.broker) {
        try {
          broker = typeof params.broker === "string" ? JSON.parse(params.broker) : params.broker;
        } catch (e) {
          // Ignore parse errors
        }
      }
      message = (params.message as string) || "";
    }
  } else {
    // Handle direct params (for backward compatibility)
    status = (params.status as "verified" | "warning" | "invalid") || "invalid";
    if (params.broker) {
      try {
        broker = typeof params.broker === "string" ? JSON.parse(params.broker) : params.broker;
      } catch (e) {
        // Ignore parse errors
      }
    }
    message = (params.message as string) || "";
  }

  const color = status === "verified" ? "#16A34A" : status === "warning" ? "#F59E0B" : "#EF4444";
  const emoji = status === "verified" ? "✅" : status === "warning" ? "⚠️" : "⛔️";

  return (
    <View style={styles.container}>
      <View style={[styles.header]}> 
        <Text style={{ fontSize: 48 }}>{emoji}</Text>
        <Text style={styles.statusText}>{status.toUpperCase()}</Text>
        <Text style={styles.statusSub}>
          {message || (status === "verified" ? "Broker is approved." : status === "warning" ? "Broker not currently approved." : "Unrecognized QR data.")}
        </Text>
      </View>

      <Card style={{ width: "100%", marginBottom: spacing.lg }}>
        <Text style={styles.cardTitle}>Broker details</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={[styles.avatar, { backgroundColor: "#CBD5E1" }] }>
            <Text style={styles.avatarText}>{(broker?.name ?? "?").split(" ").map((p: string) => p[0]).slice(0,2).join("")}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{broker?.name ?? "Unknown broker"}</Text>
            <Text style={styles.meta}>License: {broker?.license ?? "N/A"}</Text>
            <Text style={styles.meta}>ID: {broker?.id ?? "N/A"}</Text>
          </View>
        </View>
      </Card>

      <Card style={{ width: "100%", marginBottom: spacing.lg }}>
        <Text style={styles.cardTitle}>Actions</Text>
        <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
          <Button title="Call broker" variant="ghost" leftIcon="call" onPress={() => {}} />
          <Button title="Email broker" variant="ghost" leftIcon="mail" onPress={() => {}} />
          <Button title="Report issue" variant="ghost" leftIcon="alert" onPress={() => {}} />
        </View>
        {isAuthenticated && (
          <View style={{ marginTop: spacing.md }}>
            <Button 
              title="Report Violation" 
              variant="ghost" 
              leftIcon="warning" 
              onPress={() => setShowViolationModal(true)}
              style={{ backgroundColor: "#FEF2F2" }}
            />
          </View>
        )}
      </Card>

      {/* Violation Reporting Modal */}
      <Modal
        visible={showViolationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowViolationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Report Violation</Text>
            
            <Text style={styles.label}>Violation Type</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., license_expired, unapproved, other"
              value={violationType}
              onChangeText={setViolationType}
            />

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the violation..."
              value={violationNotes}
              onChangeText={setViolationNotes}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => {
                  setShowViolationModal(false);
                  setViolationType("");
                  setViolationNotes("");
                }}
              />
              <Button
                title={submitting ? "Submitting..." : "Submit"}
                onPress={async () => {
                  if (!violationType && !violationNotes) {
                    Alert.alert("Error", "Please provide violation type or notes");
                    return;
                  }

                  setSubmitting(true);
                  try {
                    const qrCodeId = params.payload ? 
                      JSON.parse(params.payload as string).qrCodeId || "" : "";
                    
                    const result = await submitInspection({
                      qrCodeId,
                      verificationResult: params.payload ? JSON.parse(params.payload as string) : {},
                      violationType: violationType || undefined,
                      violationNotes: violationNotes || undefined,
                    });

                    if (result.offline) {
                      Alert.alert(
                        "Queued for Sync",
                        "Violation report has been saved offline and will sync when connection is available."
                      );
                    } else {
                      Alert.alert("Success", "Violation report submitted successfully");
                    }

                    setShowViolationModal(false);
                    setViolationType("");
                    setViolationNotes("");
                  } catch (error: any) {
                    Alert.alert("Error", error.message || "Failed to submit violation report");
                  } finally {
                    setSubmitting(false);
                  }
                }}
                disabled={submitting}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 24, alignItems: "center" },
  header: { width: "100%", alignItems: "center", marginVertical: 16 },
  statusText: { marginTop: 8, fontSize: 18, fontWeight: "800", color: colors.fg.strong, letterSpacing: 1 },
  statusSub: { marginTop: 6, color: colors.fg.muted, textAlign: "center" },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.fg.strong, marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 999, marginRight: 12, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "white", fontWeight: "800" },
  name: { fontSize: 18, fontWeight: "800", color: colors.fg.strong },
  meta: { marginTop: 4, color: colors.fg.muted },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.fg.strong,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.fg.strong,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.fg.muted,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
});

