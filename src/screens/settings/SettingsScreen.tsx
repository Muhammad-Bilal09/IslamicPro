import React from 'react';
import { Pressable, ScrollView, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { RowProps } from '@/types/type';

import { useSettings, METHOD_NAMES, SCHOOL_NAMES } from './UseSettings';
import { styles } from './SettingsStyle';

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
  const {
    router,
    player,
    isPlaying,
    prayerReminder,
    dailyAyah,
    setDailyAyah,
    sound,
    darkMode,
    setDarkMode,
    calculationMethod,
    juristicSchool,
    handleToggleReminder,
    handleToggleSound,
    handleTestAlert,
    handleSelectMethod,
    handleSelectSchool,
  } = useSettings();

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
            onToggle={handleToggleReminder}
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
            onToggle={handleToggleSound}
          />
          <Row
            icon={isPlaying ? "pause-outline" : "play-outline"}
            label={isPlaying ? "Pause Adhan Preview" : "Preview Adhan Sound"}
            onPress={() => {
              try {
                if (isPlaying) {
                  player.pause();
                } else {
                  player.seekTo(0);
                  player.play();
                }
              } catch (err) {
                console.error('Failed to preview Adhan:', err);
              }
            }}
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
          <Row
            icon="calculator-outline"
            label="Calculation Method"
            detail={METHOD_NAMES[calculationMethod] || 'ISNA (North America)'}
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

        {/* General */}
        <ThemedText style={styles.groupLabel} themeColor="textSecondary">
          General
        </ThemedText>
        <View style={[styles.group, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Row icon="information-circle-outline" label="About IslamicPro" detail="v1.0.0" />
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

export default SettingsScreen;
