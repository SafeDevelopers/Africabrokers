import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { Card } from "../src/components/Card";
import { colors, spacing } from "../src/theme";
import { getHistory, clearHistory, type HistoryItem } from "../src/lib/storage";
import { statusColor, timeAgo } from "../src/mock/data";

export default function HistoryScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const items = await getHistory();
      setHistory(items);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    await clearHistory();
    setHistory([]);
  };

  const handleItemPress = (item: HistoryItem) => {
    router.push({
      pathname: "/result",
      params: {
        status: item.status,
        broker: item.broker ? JSON.stringify(item.broker) : undefined,
        message: item.message || "",
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading history...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan History</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles.clearBtn}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <Card style={{ width: "100%" }}>
          <Text style={styles.emptyText}>No scan history yet.</Text>
          <Text style={styles.emptySubtext}>Start scanning QR codes to see them here.</Text>
        </Card>
      ) : (
        <Card style={{ width: "100%" }}>
          <FlatList
            scrollEnabled={false}
            data={history}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleItemPress(item)}
                style={styles.scanRow}
              >
                <View style={[styles.avatar, { backgroundColor: "#CBD5E1" }] }>
                  <Text style={styles.avatarText}>
                    {(item.broker?.name ?? "?").split(" ").map((p: string) => p[0]).slice(0,2).join("")}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.scanPrimary}>{item.broker?.name ?? "Unknown broker"}</Text>
                  <Text style={styles.scanSecondary}>
                    {item.broker ? item.broker.license : "No broker attached"}
                  </Text>
                </View>
                <View style={statusBadgeStyle(item.status)}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
                <Text style={styles.when}>{timeAgo(item.scannedAt)}</Text>
              </TouchableOpacity>
            )}
          />
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
    marginBottom: 24 
  },
  title: { fontSize: 26, fontWeight: "700", color: colors.fg.strong },
  clearBtn: { color: "#EF4444", fontWeight: "600" },
  emptyText: { fontSize: 16, fontWeight: "600", color: colors.fg.strong, textAlign: "center", marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: colors.fg.muted, textAlign: "center" },
  scanRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 999,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: { color: "white", fontWeight: "800" },
  scanPrimary: { fontWeight: "700", color: colors.fg.strong },
  scanSecondary: { color: colors.fg.muted, marginTop: 2 },
  statusText: { color: colors.fg.default, fontWeight: "700", textTransform: "capitalize" },
  when: { color: colors.fg.muted }
});

function statusBadgeStyle(s: "verified" | "warning" | "invalid"): ViewStyle {
  return {
    backgroundColor: `${statusColor(s)}22`,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginHorizontal: 8
  };
}

