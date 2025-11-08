import { useEffect, useState, useCallback } from "react";
import { Stack, useRouter, useSegments, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthProvider } from "../src/context/auth-context";
import { colors } from "../src/theme";

const TERMS_AGREED_KEY = "@afribrok_terms_agreed";

export default function Layout() {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState<boolean | null>(null);

  useEffect(() => {
    checkTermsAgreement();
  }, []);

  useEffect(() => {
    if (!isReady || hasAgreedToTerms === null) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTermsScreen = segments[0] === "terms";

    if (!hasAgreedToTerms && !inTermsScreen) {
      // Only redirect to terms if we're not already there
      router.replace("/terms");
    } else if (hasAgreedToTerms && inTermsScreen) {
      // If terms are agreed and we're on terms screen, navigate to home
      // Use a small delay to ensure state is fully updated
      setTimeout(() => {
        router.replace("/");
      }, 100);
    }
  }, [hasAgreedToTerms, segments, isReady, router]);

  // Re-check terms agreement periodically to catch AsyncStorage changes
  useEffect(() => {
    if (!isReady) return;

    const checkTermsPeriodically = async () => {
      try {
        const agreed = await AsyncStorage.getItem(TERMS_AGREED_KEY);
        const newAgreed = agreed === "true";
        if (newAgreed !== hasAgreedToTerms) {
          setHasAgreedToTerms(newAgreed);
        }
      } catch (error) {
        console.error("Failed to check terms periodically:", error);
      }
    };

    // Check every 200ms to catch AsyncStorage changes quickly
    const interval = setInterval(checkTermsPeriodically, 200);
    
    return () => clearInterval(interval);
  }, [isReady, hasAgreedToTerms]);

  const checkTermsAgreement = async () => {
    try {
      const agreed = await AsyncStorage.getItem(TERMS_AGREED_KEY);
      setHasAgreedToTerms(agreed === "true");
    } catch (error) {
      console.error("Failed to check terms agreement:", error);
      setHasAgreedToTerms(false);
    } finally {
      setIsReady(true);
    }
  };

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerTitleAlign: "center" }}>
          <Stack.Screen name="index" options={{ title: "Home", headerShown: false }} />
          <Stack.Screen name="terms" options={{ title: "Terms & Conditions", headerShown: false }} />
          <Stack.Screen name="scan" options={{ title: "Scan QR Code" }} />
          <Stack.Screen name="result" options={{ title: "Verification" }} />
          <Stack.Screen name="history" options={{ title: "History" }} />
          <Stack.Screen name="settings" options={{ title: "Settings" }} />
          <Stack.Screen name="sync" options={{ title: "Sync Center" }} />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bg.page,
  },
});

