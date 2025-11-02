import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Card } from "../src/components/Card";
import { Button } from "../src/components/Button";
import { colors, spacing } from "../src/theme";

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
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
      </Card>
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
  meta: { marginTop: 4, color: colors.fg.muted }
});

