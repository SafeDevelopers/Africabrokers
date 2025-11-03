import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useAuth } from '../src/context/auth-context';
import { Card } from '../src/components/Card';
import { Button } from '../src/components/Button';
import { colors, spacing } from '../src/theme';
import { getPendingSyncItems, OfflineInspection } from '../src/lib/offline-sync';
import { syncPendingInspections } from '../src/lib/inspections-api';

export default function SyncScreen() {
  const { isAuthenticated, user } = useAuth();
  const [pendingItems, setPendingItems] = useState<OfflineInspection[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPendingItems();
  }, []);

  const loadPendingItems = async () => {
    try {
      const items = await getPendingSyncItems();
      setPendingItems(items);
    } catch (error) {
      console.error('Failed to load pending items:', error);
    }
  };

  const handleSync = async () => {
    if (!isAuthenticated) {
      Alert.alert('Authentication Required', 'Please sign in to Inspector Mode to sync.');
      return;
    }

    setSyncing(true);
    try {
      const result = await syncPendingInspections();
      Alert.alert(
        'Sync Complete',
        `Synced: ${result.synced}\nFailed: ${result.failed}`
      );
      await loadPendingItems();
    } catch (error: any) {
      Alert.alert('Sync Failed', error.message || 'Failed to sync inspections');
    } finally {
      setSyncing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPendingItems();
    setRefreshing(false);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Please sign in to Inspector Mode to access sync center.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Card style={{ width: '100%', marginBottom: spacing.lg }}>
        <Text style={styles.cardTitle}>Offline Queue</Text>
        <Text style={styles.description}>
          {pendingItems.length} item{pendingItems.length !== 1 ? 's' : ''} pending sync
        </Text>
        
        <Button
          title={syncing ? 'Syncing...' : 'Sync Now'}
          onPress={handleSync}
          disabled={syncing || pendingItems.length === 0}
          style={{ marginTop: spacing.md }}
        />
      </Card>

      {pendingItems.length > 0 ? (
        <Card style={{ width: '100%' }}>
          <Text style={styles.cardTitle}>Pending Inspections</Text>
          {pendingItems.map((item) => (
            <View key={item.id} style={styles.queueItem}>
              <View style={styles.queueItemHeader}>
                <Text style={styles.queueItemTitle}>QR: {item.qrCodeId}</Text>
                <Text style={[styles.queueItemStatus, { color: item.status === 'failed' ? '#EF4444' : '#F59E0B' }]}>
                  {item.status === 'failed' ? 'Failed' : 'Pending'}
                </Text>
              </View>
              {item.violationType && (
                <Text style={styles.queueItemMeta}>Type: {item.violationType}</Text>
              )}
              {item.error && (
                <Text style={styles.queueItemError}>Error: {item.error}</Text>
              )}
              <Text style={styles.queueItemTime}>
                Created: {new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>
          ))}
        </Card>
      ) : (
        <Card style={{ width: '100%' }}>
          <Text style={styles.message}>No pending sync items</Text>
          <Text style={styles.description}>All inspections have been synced successfully.</Text>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.fg.strong, marginBottom: 12 },
  description: { fontSize: 14, color: colors.fg.muted, marginBottom: spacing.sm },
  message: { fontSize: 16, fontWeight: '600', color: colors.fg.strong, textAlign: 'center', marginBottom: spacing.sm },
  queueItem: {
    borderWidth: 1,
    borderColor: colors.fg.muted + '40',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  queueItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  queueItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.fg.strong,
    flex: 1,
  },
  queueItemStatus: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  queueItemMeta: {
    fontSize: 12,
    color: colors.fg.muted,
    marginTop: spacing.xs,
  },
  queueItemError: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: spacing.xs,
  },
  queueItemTime: {
    fontSize: 11,
    color: colors.fg.muted,
    marginTop: spacing.xs,
  },
});

