import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
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

import { checkAndScheduleNotifications } from '@/utils/notifications';
import {
  convert24hTo12h,
  fetchPrayerTimesByCity,
  fetchPrayerTimesByCoords,
  getCurrentAndNextPrayer,
  PrayerTimings,
} from '@/utils/prayerApi';

interface DayItem {
  dayName: string;
  dayNum: number;
}

/** Converts seconds to HH:MM:SS display string */
function formatCountdown(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(safeSeconds / 3600);
  const m = Math.floor((safeSeconds % 3600) / 60);
  const s = safeSeconds % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, '0')).join(':');
}

export function PrayerScreen() {
  const theme = useTheme();

  const [city, setCity] = useState('London');
  const [country, setCountry] = useState('United Kingdom');
  const [method, setMethod] = useState(2);
  const [hijriDate, setHijriDate] = useState('Loading Date...');
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimings | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [inputCity, setInputCity] = useState('London');
  const [inputCountry, setInputCountry] = useState('United Kingdom');
  const [showConfig, setShowConfig] = useState(false);
  const [useGPS, setUseGPS] = useState(false);

  const [nextPrayerName, setNextPrayerName] = useState('...');
  const [nextPrayerTime, setNextPrayerTime] = useState('...');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentPrayerName, setCurrentPrayerName] = useState('...');

  const [prayerToggles, setPrayerToggles] = useState<Record<string, boolean>>({
    Fajr: true,
    Sunrise: false,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true,
  });

  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const days: DayItem[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i - 3);
    return {
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      dayNum: d.getDate(),
    };
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedToggles = await AsyncStorage.getItem('prayer_alerts');
        if (storedToggles) setPrayerToggles(JSON.parse(storedToggles));

        const storedCity = await AsyncStorage.getItem('prayer_city');
        const storedCountry = await AsyncStorage.getItem('prayer_country');
        const storedGPS = await AsyncStorage.getItem('prayer_use_gps');
        const storedMethod = await AsyncStorage.getItem('prayer_method');
        const currentMethod = storedMethod ? parseInt(storedMethod, 10) : 2;
        setMethod(currentMethod);

        if (storedGPS === 'true') {
          setUseGPS(true);
          const storedLat = await AsyncStorage.getItem('prayer_lat');
          const storedLng = await AsyncStorage.getItem('prayer_lng');
          if (storedLat && storedLng) {
            await fetchTimingsByCoords(parseFloat(storedLat), parseFloat(storedLng), currentMethod);
            return;
          }
        }

        const currentCity = storedCity || 'London';
        const currentCountry = storedCountry || 'United Kingdom';
        setCity(currentCity);
        setCountry(currentCountry);
        setInputCity(currentCity);
        setInputCountry(currentCountry);
        await fetchTimingsByCity(currentCity, currentCountry, currentMethod);
      } catch (err) {
        console.error('[PrayerScreen] Error loading settings:', err);
        await fetchTimingsByCity('London', 'United Kingdom', 2);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    if (!prayerTimes) return;
    const updateCountdown = () => {
      const info = getCurrentAndNextPrayer(prayerTimes);
      setCurrentPrayerName(info.current);
      setNextPrayerName(info.next);
      setNextPrayerTime(info.nextTime);
      setSecondsLeft(info.secondsLeft);
      setProgress(info.progress);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  const fetchTimingsByCity = async (cityName: string, countryName: string, methodId: number) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchPrayerTimesByCity(cityName, countryName, methodId);
      setPrayerTimes(data.timings);
      setHijriDate(`${data.date.hijri.day} ${data.date.hijri.month.en} ${data.date.hijri.year} AH`);
      await checkAndScheduleNotifications(null, true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch prayer times.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTimingsByCoords = async (lat: number, lng: number, methodId: number) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchPrayerTimesByCoords(lat, lng, methodId);
      setPrayerTimes(data.timings);
      setHijriDate(`${data.date.hijri.day} ${data.date.hijri.month.en} ${data.date.hijri.year} AH`);
      await checkAndScheduleNotifications(null, true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch prayer times by GPS.');
    } finally {
      setIsLoading(false);
    }
  };

  const calibrateGPS = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission denied. Please set manually.');
        setIsLoading(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const lat = location.coords.latitude;
      const lng = location.coords.longitude;

      let detectedCity = 'Current Location';
      let detectedCountry = '';
      try {
        const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (geocode && geocode.length > 0) {
          detectedCity = geocode[0].city || geocode[0].subregion || geocode[0].district || 'Current Location';
          detectedCountry = geocode[0].country || '';
        }
      } catch { }

      setCity(detectedCity);
      setCountry(detectedCountry);
      setInputCity(detectedCity);
      setInputCountry(detectedCountry);
      setUseGPS(true);
      setShowConfig(false);

      await AsyncStorage.setItem('prayer_city', detectedCity);
      await AsyncStorage.setItem('prayer_country', detectedCountry);
      await AsyncStorage.setItem('prayer_use_gps', 'true');
      await AsyncStorage.setItem('prayer_lat', lat.toString());
      await AsyncStorage.setItem('prayer_lng', lng.toString());
      await fetchTimingsByCoords(lat, lng, method);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to detect location.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveManualLocation = async () => {
    if (!inputCity.trim()) {
      setErrorMsg('City name is required.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    setShowConfig(false);
    setUseGPS(false);
    const finalCity = inputCity.trim();
    const finalCountry = inputCountry.trim() || 'Global';
    try {
      await AsyncStorage.setItem('prayer_city', finalCity);
      await AsyncStorage.setItem('prayer_country', finalCountry);
      await AsyncStorage.setItem('prayer_use_gps', 'false');
      setCity(finalCity);
      setCountry(finalCountry);
      await fetchTimingsByCity(finalCity, finalCountry, method);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update location.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (prayerName: string) => {
    const newToggles = { ...prayerToggles, [prayerName]: !prayerToggles[prayerName] };
    setPrayerToggles(newToggles);
    await AsyncStorage.setItem('prayer_alerts', JSON.stringify(newToggles));
    await checkAndScheduleNotifications(null, true);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <Header title="Noor" />
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

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: 120,
    gap: Spacing.three,
  },

  // ── Hero ──
  heroCard: {
    padding: 0,
    overflow: 'hidden',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  locationIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationTextWrap: {
    flex: 1,
  },
  locationCity: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  hijriText: {
    fontSize: 11,
    opacity: 0.75,
    marginTop: 1,
  },
  editChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  editChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  heroDivider: {
    height: 1,
    marginHorizontal: Spacing.four,
  },
  heroLoader: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
    gap: Spacing.two,
  },
  heroLoaderText: {
    fontSize: 13,
    opacity: 0.8,
  },
  heroBody: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
    gap: Spacing.one,
  },
  nextLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    opacity: 0.7,
    marginBottom: 2,
    paddingBottom: 20
  },
  nextPrayerName: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 2,
    padding: 5
  },
  countdownTimer: {
    fontSize: 50,
    fontWeight: '900',
    letterSpacing: 3,
    paddingVertical: 12,
    marginVertical: Spacing.one,
  },
  nextAt: {
    fontSize: 13,
    opacity: 0.75,
    marginBottom: Spacing.three,
  },
  progressSubCard: {
    width: '100%',
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rangeText: {
    fontSize: 11,
    opacity: 0.8,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 11,
    opacity: 0.65,
    fontWeight: '600',
  },
  progressBar: {
    width: '100%',
  },

  configCard: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  configTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: 14,
    gap: Spacing.two,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  inputGroup: {
    gap: Spacing.one,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontSize: 14,
  },

  // ── Error ──
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 13,
    color: '#991B1B',
    flex: 1,
  },

  // ── Calendar ──
  section: {
    gap: Spacing.two,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  calendarRow: {
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  dayPill: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 52,
    gap: 2,
  },
  dayName: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dayNum: {
    fontSize: 17,
    fontWeight: '800',
  },

  // ── Prayer List ──
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.two,
  },
  emptyText: {
    fontSize: 14,
  },

  // ── Ayat Footer ──
  ayatCard: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.five,
  },
  ayatIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  ayatText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
    paddingHorizontal: Spacing.two,
  },
  ayatRefLine: {
    width: 40,
    height: 1,
    marginVertical: Spacing.one,
  },
  ayatRef: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    opacity: 0.8,
  },
  bottomSpacer: { height: 20 },
});
