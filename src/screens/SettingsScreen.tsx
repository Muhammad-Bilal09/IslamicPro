import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { triggerTestNotification } from '@/utils/notifications';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RowProps {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  toggle?: boolean;
  value?: boolean;
  onToggle?: () => void;
  onPress?: () => void;
  detail?: string;
  isLast?: boolean;
}

function Row({ label, icon, toggle, value, onToggle, onPress, detail, isLast }: RowProps) {
  const theme = useTheme();
  const content = (
    <View
      style={[
        styles.row,
        { borderBottomColor: theme.border },
        isLast && { borderBottomWidth: 0 },
      ]}
    >
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={20} color={theme.primary} style={styles.rowIcon} />
        <ThemedText style={styles.rowLabel}>{label}</ThemedText>
      </View>
      {toggle ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: theme.border, true: theme.primaryLight }}
          thumbColor={value ? theme.primary : theme.tabIconDefault}
        />
      ) : (
        <View style={styles.rowRight}>
          {detail && (
            <ThemedText style={styles.rowDetail} themeColor="textSecondary">
              {detail}
            </ThemedText>
          )}
          <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
}

export function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [prayerReminder, setPrayerReminder] = useState(true);
  const [dailyAyah, setDailyAyah] = useState(true);
  const [sound, setSound] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleTestAlert = async () => {
    const id = await triggerTestNotification();
    if (id) {
      Alert.alert(
        'Test Alert Scheduled ✅',
        'You will receive a test prayer notification in 5 seconds. Please put the app in the background.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Alert Failed ❌',
        'Could not schedule notification. Please check that notification permissions are enabled for this app in your device settings.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Settings</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Notifications */}
        <ThemedText style={styles.groupLabel} themeColor="textSecondary">
          Notifications
        </ThemedText>
        <View style={[styles.group, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Row
            icon="calendar-outline"
            label="Prayer Reminders"
            toggle
            value={prayerReminder}
            onToggle={() => setPrayerReminder((v) => !v)}
          />
          <Row
            icon="book-outline"
            label="Daily Ayah"
            toggle
            value={dailyAyah}
            onToggle={() => setDailyAyah((v) => !v)}
          />
          <Row
            icon="volume-high-outline"
            label="Adhan Sound"
            toggle
            value={sound}
            onToggle={() => setSound((v) => !v)}
          />
          <Row
            icon="notifications-outline"
            label="Send Test Alert (5s)"
            onPress={handleTestAlert}
            isLast
          />
        </View>

        {/* Appearance */}
        <ThemedText style={styles.groupLabel} themeColor="textSecondary">
          Appearance
        </ThemedText>
        <View style={[styles.group, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Row
            icon="moon-outline"
            label="Dark Mode"
            toggle
            value={darkMode}
            onToggle={() => setDarkMode((v) => !v)}
          />
          <Row
            icon="language-outline"
            label="Language"
            detail="English"
            isLast
          />
        </View>

        {/* Prayer */}
        <ThemedText style={styles.groupLabel} themeColor="textSecondary">
          Prayer
        </ThemedText>
        <View style={[styles.group, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Row icon="compass-outline" label="Qibla Method" detail="GPS" />
          <Row icon="calculator-outline" label="Calculation Method" detail="MWL" isLast />
        </View>

        {/* General */}
        <ThemedText style={styles.groupLabel} themeColor="textSecondary">
          General
        </ThemedText>
        <View style={[styles.group, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Row icon="information-circle-outline" label="About Noor" detail="v1.0.0" />
          <Row icon="help-circle-outline" label="Help & FAQ" />
          <Row icon="mail-outline" label="Contact Us" isLast />
        </View>

        {/* Sign Out */}
        <Pressable
          style={[styles.signOutBtn, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}
        >
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  content: { padding: Spacing.four, paddingBottom: 100, gap: Spacing.two },
  groupLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: Spacing.three,
    marginBottom: Spacing.one,
    marginLeft: Spacing.one,
  },
  group: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, flex: 1 },
  rowIcon: { width: 24 },
  rowLabel: { fontSize: 15 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  rowDetail: { fontSize: 14 },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    marginTop: Spacing.four,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  signOutText: { fontSize: 15, fontWeight: '600', color: '#DC2626' },
});
