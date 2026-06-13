import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Card from '@/components/card';
import Header from '@/components/header';
import PrayerTimeRow from '@/components/prayer-time-row';
import ProgressBar from '@/components/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { convert24hTo12h } from '@/utils/prayerApi';

import { usePrayer, formatCountdown } from './UsePrayer';
import { styles } from './PrayerStyle';

export function PrayerScreen() {
  const theme = useTheme();
  const {
    city,
    country,
    hijriDate,
    prayerTimes,
    isLoading,
    errorMsg,
    setErrorMsg,
    inputCity,
    setInputCity,
    inputCountry,
    setInputCountry,
    showConfig,
    setShowConfig,
    useGPS,
    nextPrayerName,
    nextPrayerTime,
    secondsLeft,
    progress,
    currentPrayerName,
    prayerToggles,
    selectedDay,
    setSelectedDay,
    days,
    calibrateGPS,
    saveManualLocation,
    handleToggle,
  } = usePrayer();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <Header title="Prayers" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Hero Countdown Card ── */}
        <Card variant="primary" style={styles.heroCard}>
          {/* Location Row */}
          <Pressable style={styles.locationRow} onPress={() => setShowConfig(!showConfig)}>
            <View style={styles.locationLeft}>
              <View style={[styles.locationIconWrap, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Ionicons name={useGPS ? 'navigate' : 'location'} size={13} color={theme.textOnPrimary} />
              </View>
              <View style={styles.locationTextWrap}>
                <ThemedText style={styles.locationCity} themeColor="textOnPrimary">
                  {city.toUpperCase()}{country ? `, ${country.toUpperCase()}` : ''}
                </ThemedText>
                <ThemedText style={styles.hijriText} themeColor="textOnPrimary">
                  {hijriDate}
                </ThemedText>
              </View>
            </View>
            <View style={[styles.editChip, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name={showConfig ? 'close' : 'create-outline'} size={13} color={theme.textOnPrimary} />
              <ThemedText style={styles.editChipText} themeColor="textOnPrimary">
                {showConfig ? 'Close' : 'Edit'}
              </ThemedText>
            </View>
          </Pressable>

          {/* Separator */}
          <View style={[styles.heroDivider, { backgroundColor: 'rgba(255,255,255,0.18)' }]} />

          {/* Body */}
          {isLoading ? (
            <View style={styles.heroLoader}>
              <ActivityIndicator size="large" color="rgba(255,255,255,0.85)" />
              <ThemedText style={styles.heroLoaderText} themeColor="textOnPrimary">
                Updating timings...
              </ThemedText>
            </View>
          ) : (
            <View style={styles.heroBody}>
              <ThemedText style={styles.nextLabel} themeColor="textOnPrimary">
                NEXT PRAYER
              </ThemedText>
              <ThemedText style={styles.nextPrayerName} themeColor="textOnPrimary">
                {nextPrayerName}
              </ThemedText>
              <ThemedText style={styles.countdownTimer} themeColor="textOnPrimary">
                {formatCountdown(secondsLeft)}
              </ThemedText>
              <ThemedText style={styles.nextAt} themeColor="textOnPrimary">
                {nextPrayerName} at {nextPrayerTime}
              </ThemedText>

              {/* Sub-card: progress */}
              <View style={[styles.progressSubCard, { backgroundColor: theme.primaryDark }]}>
                <View style={styles.rangeLabels}>
                  <ThemedText style={styles.rangeText} themeColor="textOnPrimary">
                    {currentPrayerName}
                  </ThemedText>
                  <ThemedText style={styles.progressPercent} themeColor="textOnPrimary">
                    {Math.floor(progress * 100)}% passed
                  </ThemedText>
                  <ThemedText style={styles.rangeText} themeColor="textOnPrimary">
                    {nextPrayerName}
                  </ThemedText>
                </View>
                <ProgressBar
                  progress={progress}
                  height={6}
                  trackColor="rgba(255,255,255,0.2)"
                  progressColor={theme.accent}
                  style={styles.progressBar}
                />
              </View>
            </View>
          )}
        </Card>

        {/* ── Location Config Panel ── */}
        {showConfig && (
          <Card variant="outlined" style={styles.configCard}>
            <ThemedText style={[styles.configTitle, { color: theme.text }]}>
              Configure Location
            </ThemedText>

            <Pressable style={[styles.gpsButton, { backgroundColor: theme.primary }]} onPress={calibrateGPS}>
              <Ionicons name="navigate-circle-outline" size={20} color={theme.textOnPrimary} />
              <ThemedText style={styles.actionButtonText} themeColor="textOnPrimary">
                Use My GPS Location
              </ThemedText>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              <ThemedText style={styles.dividerLabel} themeColor="textSecondary">OR ENTER MANUALLY</ThemedText>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel} themeColor="textSecondary">City Name</ThemedText>
              <TextInput
                style={[styles.textInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.backgroundElement }]}
                value={inputCity}
                onChangeText={setInputCity}
                placeholder="e.g. Cairo"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel} themeColor="textSecondary">Country Name</ThemedText>
              <TextInput
                style={[styles.textInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.backgroundElement }]}
                value={inputCountry}
                onChangeText={setInputCountry}
                placeholder="e.g. Egypt"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <Pressable style={[styles.gpsButton, { backgroundColor: theme.primary }]} onPress={saveManualLocation}>
              <Ionicons name="checkmark-circle-outline" size={20} color={theme.textOnPrimary} />
              <ThemedText style={styles.actionButtonText} themeColor="textOnPrimary">Save & Apply</ThemedText>
            </Pressable>
          </Card>
        )}

        {/* ── Error Banner ── */}
        {errorMsg && (
          <View style={[styles.errorBanner, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>
            <Pressable onPress={() => setErrorMsg(null)}>
              <Ionicons name="close-circle" size={18} color="#DC2626" />
            </Pressable>
          </View>
        )}

        {/* ── Date Calendar Strip ── */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel} themeColor="textSecondary">SELECT DATE</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarRow}>
            {days.map((day) => {
              const isSelected = day.dayNum === selectedDay;
              return (
                <Pressable
                  key={day.dayNum}
                  onPress={() => setSelectedDay(day.dayNum)}
                  style={[
                    styles.dayPill,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.cardBackground,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <ThemedText style={[styles.dayName, { color: isSelected ? theme.textOnPrimary : theme.textSecondary }]}>
                    {day.dayName}
                  </ThemedText>
                  <ThemedText style={[styles.dayNum, { color: isSelected ? theme.textOnPrimary : theme.text }]}>
                    {day.dayNum}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Prayer Times ── */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel} themeColor="textSecondary">PRAYER TIMES</ThemedText>
          {prayerTimes ? (
            <View>
              <PrayerTimeRow name="Fajr" type="MANDATORY" time={convert24hTo12h(prayerTimes.Fajr)} iconName="cloudy-night-outline" isActive={currentPrayerName === 'Fajr'} isEnabled={prayerToggles.Fajr} onToggle={() => handleToggle('Fajr')} />
              <PrayerTimeRow name="Sunrise" type="NON-OBLIGATORY" time={convert24hTo12h(prayerTimes.Sunrise)} iconName="sunny-outline" isActive={currentPrayerName === 'Sunrise'} isEnabled={prayerToggles.Sunrise} onToggle={() => handleToggle('Sunrise')} />
              <PrayerTimeRow name="Dhuhr" type="MANDATORY" time={convert24hTo12h(prayerTimes.Dhuhr)} iconName="sunny" isActive={currentPrayerName === 'Dhuhr'} isEnabled={prayerToggles.Dhuhr} onToggle={() => handleToggle('Dhuhr')} />
              <PrayerTimeRow name="Asr" type="MANDATORY" time={convert24hTo12h(prayerTimes.Asr)} iconName="partly-sunny-outline" isActive={currentPrayerName === 'Asr'} isEnabled={prayerToggles.Asr} onToggle={() => handleToggle('Asr')} />
              <PrayerTimeRow name="Maghrib" type="MANDATORY" time={convert24hTo12h(prayerTimes.Maghrib)} iconName="moon-outline" isActive={currentPrayerName === 'Maghrib'} isEnabled={prayerToggles.Maghrib} onToggle={() => handleToggle('Maghrib')} />
              <PrayerTimeRow name="Isha" type="MANDATORY" time={convert24hTo12h(prayerTimes.Isha)} iconName="moon" isActive={currentPrayerName === 'Isha'} isEnabled={prayerToggles.Isha} onToggle={() => handleToggle('Isha')} />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <ActivityIndicator color={theme.primary} size="large" />
              <ThemedText style={styles.emptyText} themeColor="textSecondary">
                Fetching prayer timings...
              </ThemedText>
            </View>
          )}
        </View>

        {/* ── Ayat Footer ── */}
        <Card variant="primary" style={styles.ayatCard}>
          <View style={[styles.ayatIconWrap, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Ionicons name="book-outline" size={20} color={theme.textOnPrimary} />
          </View>
          <ThemedText style={styles.ayatText} themeColor="textOnPrimary">
            "Maintain with care the [obligatory] prayers and [in particular] the middle prayer and stand before Allah, devoutly obedient."
          </ThemedText>
          <View style={[styles.ayatRefLine, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
          <ThemedText style={styles.ayatRef} themeColor="textOnPrimary">
            SURAH AL-BAQARAH 2:238
          </ThemedText>
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default PrayerScreen;
