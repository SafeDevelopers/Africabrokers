// app/terms.tsx (Terms & Conditions screen)
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, spacing, radii } from "../src/theme";

const TERMS_AGREED_KEY = "@afribrok_terms_agreed";

export default function TermsAndConditionsScreen() {
  const router = useRouter();
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!isChecked) {
      Alert.alert("Agreement Required", "You must agree to the Terms & Conditions to continue.");
      return;
    }

    if (isSubmitting) {
      return; // Prevent double submission
    }

    setIsSubmitting(true);

    try {
      // Save the agreement
      await AsyncStorage.setItem(TERMS_AGREED_KEY, "true");
      
      // Verify it was saved
      const saved = await AsyncStorage.getItem(TERMS_AGREED_KEY);
      if (saved !== "true") {
        throw new Error("Failed to verify agreement was saved");
      }
      
      // Wait a moment to ensure AsyncStorage is fully committed and layout state updates
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate to home screen - the layout will handle the navigation
      // But we also try to navigate directly as a fallback
      router.replace("/");
      
      // Also try after a brief moment to ensure navigation happens
      setTimeout(() => {
        router.replace("/");
      }, 200);
    } catch (error) {
      console.error("Failed to save terms agreement:", error);
      Alert.alert("Error", "Failed to save agreement. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.title}>Terms & Conditions</Text>
        
        <View style={styles.content}>
          <Text style={styles.paragraph}>
            Welcome to AfriBrok Inspector! By using this application, you agree to be bound by the following terms and conditions. Please read them carefully.
          </Text>

          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            Your access to and use of the AfriBrok Inspector app is conditioned upon your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
          </Text>

          <Text style={styles.sectionTitle}>2. Use of the App</Text>
          <Text style={styles.paragraph}>
            The AfriBrok Inspector app is designed to facilitate the verification of broker licenses and property details through QR code scanning. You agree to use the app only for its intended purpose and in compliance with all applicable laws and regulations.
          </Text>

          <Text style={styles.sectionTitle}>3. Privacy Policy</Text>
          <Text style={styles.paragraph}>
            Your privacy is important to us. Our Privacy Policy, which is incorporated into these Terms by reference, describes how we collect, use, and disclose your personal information. By using the app, you consent to such processing and you warrant that all data provided by you is accurate.
          </Text>

          <Text style={styles.sectionTitle}>4. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            The app and its original content, features, and functionality are and will remain the exclusive property of AfriBrok and its licensors.
          </Text>

          <Text style={styles.sectionTitle}>5. Disclaimer</Text>
          <Text style={styles.paragraph}>
            The information provided through the app is for general informational purposes only. While we strive to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the app or the information, products, services, or related graphics contained on the app for any purpose.
          </Text>

          <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            In no event shall AfriBrok, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
          </Text>

          <Text style={styles.sectionTitle}>7. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.
          </Text>

          <Text style={styles.sectionTitle}>8. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms, please contact us at support@afribrok.com.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setIsChecked(!isChecked)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
            {isChecked && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            I have read and agree to the Terms & Conditions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, (!isChecked || isSubmitting) && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!isChecked || isSubmitting}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, (!isChecked || isSubmitting) && styles.buttonTextDisabled]}>
            {isSubmitting ? "Saving..." : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.page,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xl * 2,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.fg.strong,
    marginBottom: spacing.xl,
    textAlign: "center",
  },
  content: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.fg.strong,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  paragraph: {
    fontSize: 14,
    color: colors.fg.default,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  footer: {
    backgroundColor: colors.bg.card,
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.brand.primary,
    marginRight: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg.card,
  },
  checkboxChecked: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.fg.default,
    lineHeight: 20,
  },
  button: {
    width: "100%",
    backgroundColor: colors.brand.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: colors.fg.muted,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonTextDisabled: {
    color: "#FFFFFF",
  },
});

