import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { RowProps } from '@/types/type';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from './SettingsStyle';
import { METHOD_NAMES, SCHOOL_NAMES, useSettings } from './UseSettings';

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
        <View pointerEvents="none">
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: theme.border, true: theme.primaryLight }}
            thumbColor={value ? theme.primary : theme.tabIconDefault}
          />
        </View>
      ) : (
        <View style={styles.rowRight}>
          {detail && (
            <ThemedText numberOfLines={1} ellipsizeMode="tail" style={styles.rowDetail} themeColor="textSecondary">
              {detail}
            </ThemedText>
          )}
          <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
        </View>
      )}
    </View>
  );

  if (toggle && onToggle) {
    return <Pressable onPress={() => onToggle()}>{content}</Pressable>;
  }
  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
}

export function SettingsScreen() {
  const theme = useTheme();
  const {
    router,
    prayerReminder,
    dailyAyah,
    handleToggleDailyAyah,
    sound,
    calculationMethod,
    juristicSchool,
    arabicFont,
    handleSelectArabicFont,
    handleToggleReminder,
    handleToggleSound,
    handleSelectMethod,
    handleSelectSchool,
    exactAlarmAllowed,
    batteryOptEnabled,
    isOEM,
    manufacturer,
    notificationPermissionGranted,
    handleOpenAlarmSettings,
    handleOpenBatterySettings,
    handleOpenOEMAutostart,
    handleRequestNotificationPermission,
    logout,
  } = useSettings();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Settings</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!notificationPermissionGranted && (
          <View style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Ionicons name="notifications-off-outline" size={20} color="#DC2626" />
              <ThemedText style={{ color: '#991B1B', fontWeight: 'bold', fontSize: 14 }}>Push Notifications Disabled</ThemedText>
            </View>
            <ThemedText style={{ color: '#7F1D1D', fontSize: 12, marginBottom: 10 }}>
              Push notification permission is turned off in Android system settings.
            </ThemedText>
            <Pressable onPress={handleRequestNotificationPermission} style={{ backgroundColor: '#DC2626', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, alignSelf: 'flex-start' }}>
              <ThemedText style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 12 }}>Enable Notifications</ThemedText>
            </Pressable>
          </View>
        )}

        {!exactAlarmAllowed && (
          <View style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A', borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Ionicons name="alarm-outline" size={20} color="#D97706" />
              <ThemedText style={{ color: '#92400E', fontWeight: 'bold', fontSize: 14 }}>Exact Alarm Permission Required</ThemedText>
            </View>
            <ThemedText style={{ color: '#78350F', fontSize: 12, marginBottom: 10 }}>
              Android 12+ requires "Alarms & Reminders" permission to deliver prayer alerts on the exact second.
            </ThemedText>
            <Pressable onPress={handleOpenAlarmSettings} style={{ backgroundColor: '#D97706', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, alignSelf: 'flex-start' }}>
              <ThemedText style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 12 }}>Allow Exact Alarms</ThemedText>
            </Pressable>
          </View>
        )}

        {/* {batteryOptEnabled && (
          <View style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Ionicons name="battery-dead-outline" size={20} color="#2563EB" />
              <ThemedText style={{ color: '#1E40AF', fontWeight: 'bold', fontSize: 14 }}>Battery Saver Optimization Active</ThemedText>
            </View>
            <ThemedText style={{ color: '#1E3A8A', fontSize: 12, marginBottom: 10 }}>
              Select "Unrestricted" battery usage for Amin so the phone OS does not kill background alarms during deep sleep.
            </ThemedText>
            <Pressable onPress={handleOpenBatterySettings} style={{ backgroundColor: '#2563EB', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, alignSelf: 'flex-start' }}>
              <ThemedText style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 12 }}>Disable Battery Restrictions</ThemedText>
            </Pressable>
          </View>
        )} */}

        {isOEM && (
          <View style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#16A34A" />
              <ThemedText style={{ color: '#166534', fontWeight: 'bold', fontSize: 14 }}>{manufacturer.toUpperCase()} Autostart Permission</ThemedText>
            </View>
            <ThemedText style={{ color: '#14532D', fontSize: 12, marginBottom: 10 }}>
              Your device ({manufacturer}) requires "Autostart" / "Background Start" permission enabled in system settings so prayer alarms fire when app is closed.
            </ThemedText>
            <Pressable onPress={handleOpenOEMAutostart} style={{ backgroundColor: '#16A34A', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, alignSelf: 'flex-start' }}>
              <ThemedText style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 12 }}>Open Autostart Settings</ThemedText>
            </Pressable>
          </View>
        )}

        <ThemedText style={styles.groupLabel} themeColor="textSecondary">
          Notifications
        </ThemedText>
        <View style={[styles.group, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Row
            icon="calendar-outline"
            label="Prayer Reminders"
            toggle
            value={prayerReminder}
            onToggle={handleToggleReminder}
          />
          <Row
            icon="book-outline"
            label="Daily Ayah"
            toggle
            value={dailyAyah}
            onToggle={handleToggleDailyAyah}
          />
          <Row
            icon="volume-high-outline"
            label="Adhan Sound"
            toggle
            value={sound}
            onToggle={handleToggleSound}
            isLast
          />
        </View>

        <ThemedText style={styles.groupLabel} themeColor="textSecondary">
          Prayer
        </ThemedText>
        <View style={[styles.group, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Row
            icon="calculator-outline"
            label="Calculation Method"
            detail={METHOD_NAMES[calculationMethod] || 'Karachi'}
            onPress={handleSelectMethod}
          />
          <Row
            icon="calendar-outline"
            label="Juristic School (Asr)"
            detail={SCHOOL_NAMES[juristicSchool] || 'Standard (Shafi\'i)'}
            onPress={handleSelectSchool}
            isLast
          />
        </View>

        <ThemedText style={styles.groupLabel} themeColor="textSecondary">
          Quran & Display
        </ThemedText>
        <View style={[styles.group, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Row
            icon="text-outline"
            label="Arabic Font Style"
            detail={
              arabicFont === 'Amiri-Regular'
                ? 'Amiri'
                : arabicFont === 'DigitalKhattIndoPak'
                ? 'Indo-Pak'
                : 'Classic Naskh'
            }
            onPress={handleSelectArabicFont}
            isLast
          />
        </View>

        <View style={{ height: 24 }} />

        <Pressable
          onPress={logout}
          style={[styles.signOutBtn, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}
        >
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

export default SettingsScreen;
