import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/auth-context';
import { Card } from '../src/components/Card';
import { Button } from '../src/components/Button';
import { colors, spacing } from '../src/theme';

export default function SettingsScreen() {
  const { user, isAuthenticated, signIn, signOut, isLoading } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error: any) {
      alert(error?.message || 'Failed to sign in');
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={{ width: '100%', marginBottom: spacing.lg }}>
        <Text style={styles.cardTitle}>Account</Text>
        
        {isAuthenticated && user ? (
          <View>
            <View style={styles.userInfo}>
              <Text style={styles.label}>Role:</Text>
              <Text style={styles.value}>{user.role.toUpperCase()}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.label}>Tenant:</Text>
              <Text style={styles.value}>{user.tenantId}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.label}>User ID:</Text>
              <Text style={styles.value} numberOfLines={1}>{user.id}</Text>
            </View>
            <Button
              title="Sign Out"
              variant="ghost"
              onPress={handleSignOut}
              style={{ marginTop: spacing.md }}
            />
          </View>
        ) : (
          <View>
            <Text style={styles.description}>
              Sign in to Inspector Mode to unlock additional features:
            </Text>
            <View style={styles.featuresList}>
              <Text style={styles.feature}>• Report violations</Text>
              <Text style={styles.feature}>• Sync offline events</Text>
              <Text style={styles.feature}>• Access sync center</Text>
            </View>
            <Button
              title="Sign in for Inspector Mode"
              onPress={handleSignIn}
              style={{ marginTop: spacing.md }}
            />
          </View>
        )}
      </Card>

      {isAuthenticated && (
        <Card style={{ width: '100%', marginBottom: spacing.lg }}>
          <Text style={styles.cardTitle}>Inspector Features</Text>
          <Button
            title="Sync Center"
            variant="ghost"
            leftIcon="sync"
            onPress={() => router.push('/sync')}
            style={{ marginBottom: spacing.sm }}
          />
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.fg.strong, marginBottom: 12 },
  userInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14, color: colors.fg.muted, fontWeight: '600' },
  value: { fontSize: 14, color: colors.fg.strong, flex: 1, textAlign: 'right' },
  description: { fontSize: 14, color: colors.fg.muted, marginBottom: spacing.md, lineHeight: 20 },
  featuresList: { marginLeft: spacing.sm, marginBottom: spacing.md },
  feature: { fontSize: 14, color: colors.fg.muted, marginBottom: 4 },
});

