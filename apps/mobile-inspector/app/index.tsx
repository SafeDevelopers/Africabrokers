// app/index.tsx (Home screen)
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, radii } from "../src/theme";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Image 
          source={require("../assets/image/logo.png")} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>Verify broker licenses with QR codes</Text>
      </View>

      <View style={styles.cardsContainer}>
        {/* Scan QR Code Card */}
        <TouchableOpacity 
          style={styles.cardWrapper}
          onPress={() => router.push("/scan")}
          activeOpacity={0.85}
        >
          <View style={[styles.card, styles.scanCard]}>
            <View style={styles.cardContent}>
              <View style={styles.scanIconContainer}>
                <Text style={styles.scanIcon}>📷</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>Scan QR Code</Text>
                <Text style={styles.cardDescription}>
                  Scan a broker's QR code to verify their license status
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* History Card */}
        <TouchableOpacity 
          style={styles.cardWrapper}
          onPress={() => router.push("/history")}
          activeOpacity={0.85}
        >
          <View style={[styles.card, styles.historyCard]}>
            <View style={styles.cardContent}>
              <View style={styles.historyIconContainer}>
                <Text style={styles.historyIcon}>📋</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>History</Text>
                <Text style={styles.cardDescription}>
                  View your scan history and verification records
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Settings Card */}
        <TouchableOpacity 
          style={styles.cardWrapper}
          onPress={() => router.push("/settings")}
          activeOpacity={0.85}
        >
          <View style={[styles.card, styles.settingsCard]}>
            <View style={styles.cardContent}>
              <View style={styles.settingsIconContainer}>
                <Text style={styles.settingsIcon}>⚙️</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>Settings</Text>
                <Text style={styles.cardDescription}>
                  Manage your account and inspector preferences
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F1F5F9",
    padding: spacing.xl,
  },
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl * 2,
    alignItems: "center",
  },
  logo: {
    width: "90%",
    maxWidth: 320,
    height: 80,
    marginBottom: spacing.md,
    borderRadius: 10,
    overflow: "hidden",
  },
  subtitle: {
    fontSize: 16,
    color: colors.fg.muted,
    textAlign: "center",
  },
  cardsContainer: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  cardWrapper: {
    height: 160,
  },
  card: {
    height: "100%",
    borderRadius: 20, // Slightly larger radius for modern look
    padding: spacing.lg,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10, // Enhanced Android shadow for depth
  },
  // Scan QR Code Card - Blue gradient style
  scanCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  scanIconContainer: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.lg,
    shadowColor: "#2563EB",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scanIcon: {
    fontSize: 36,
  },
  // History Card - Green gradient style
  historyCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#10B981",
    shadowColor: "#10B981",
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  historyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.lg,
    shadowColor: "#10B981",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyIcon: {
    fontSize: 36,
  },
  // Settings Card - Orange gradient style
  settingsCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#F59E0B",
    shadowColor: "#F59E0B",
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  settingsIconContainer: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
    backgroundColor: "#FFFBEB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.lg,
    shadowColor: "#F59E0B",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsIcon: {
    fontSize: 36,
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  textContainer: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.fg.strong,
    marginBottom: spacing.xs,
    textAlign: "left",
  },
  cardDescription: {
    fontSize: 14,
    color: colors.fg.muted,
    textAlign: "left",
    lineHeight: 20,
  },
});
