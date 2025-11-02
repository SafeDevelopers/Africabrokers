import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerTitleAlign: "center" }}>
        <Stack.Screen name="index" options={{ title: "Scan QR" }} />
        <Stack.Screen name="result" options={{ title: "Verification" }} />
        <Stack.Screen name="history" options={{ title: "History" }} />
      </Stack>
    </SafeAreaProvider>
  );
}

