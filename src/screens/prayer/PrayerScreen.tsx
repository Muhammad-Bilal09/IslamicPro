import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useScreenData } from '@/hooks/UseScreenData';
import { convert24hTo12h } from '@/utils/prayerApi';

import { styles } from './PrayerStyle';
import { formatCountdown, usePrayer } from './UsePrayer';

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
    dailyAyahData,
    isAyahLoading,
    isDailyAyahEnabled,
  } = usePrayer();
  const { prayerTimesConfig } = useScreenData();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <Header title="Prayers" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <Card variant="primary" style={styles.heroCard}>
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

          <View style={[styles.heroDivider, { backgroundColor: 'rgba(255,255,255,0.18)' }]} />

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

        {errorMsg && (
          <View style={[styles.errorBanner, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>
            <Pressable onPress={() => setErrorMsg(null)}>
              <Ionicons name="close-circle" size={18} color="#DC2626" />
            </Pressable>
          </View>
        )}

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

        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel} themeColor="textSecondary">PRAYER TIMES</ThemedText>
          {prayerTimes ? (
            <View>
              {prayerTimesConfig.map((prayer) => (
                <PrayerTimeRow
                  key={prayer.name}
                  name={prayer.name}
                  type={prayer.type}
                  time={convert24hTo12h(prayerTimes[prayer.name])}
                  iconName={prayer.iconName}
                  isActive={currentPrayerName === prayer.name}
                  isEnabled={prayerToggles[prayer.name]}
                  onToggle={() => handleToggle(prayer.name)}
                />
              ))}
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

        {isDailyAyahEnabled && (
          <Pressable onPress={() => router.push(`/surah/${dailyAyahData.surahNumber}`)}>
            <Card variant="primary" style={styles.ayatCard}>
              <View style={[styles.ayatIconWrap, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <Ionicons name="book-outline" size={20} color={theme.textOnPrimary} />
              </View>

              {isAyahLoading ? (
                <ActivityIndicator size="small" color={theme.textOnPrimary} style={{ marginVertical: Spacing.four }} />
              ) : (
                <>
                  <ThemedText
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      marginVertical: Spacing.two,
                      lineHeight: 38,
                      fontFamily: 'serif',
                      color: theme.textOnPrimary,
                    }}
                    themeColor="textOnPrimary"
                  >
                    {dailyAyahData.text}
                  </ThemedText>

                  <ThemedText style={styles.ayatText} themeColor="textOnPrimary">
                    "{dailyAyahData.translation}"
                  </ThemedText>

                  <View style={[styles.ayatRefLine, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />

                  <ThemedText style={styles.ayatRef} themeColor="textOnPrimary">
                    SURAH {dailyAyahData.surahName.toUpperCase()} {dailyAyahData.surahNumber}:{dailyAyahData.numberInSurah}
                  </ThemedText>
                </>
              )}
            </Card>
          </Pressable>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default PrayerScreen;
