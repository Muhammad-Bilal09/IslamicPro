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
    player,
    isPlaying,
    prayerReminder,
    dailyAyah,
    handleToggleDailyAyah,
    sound,
    calculationMethod,
    juristicSchool,
    handleToggleReminder,
    handleToggleSound,
    handleTestAlert,
    handleSelectMethod,
    handleSelectSchool,
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

        <View style={{ flex: 1 }} />

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
