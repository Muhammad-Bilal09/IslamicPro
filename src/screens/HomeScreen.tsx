import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, View, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import Header from '@/components/header';
import Card from '@/components/card';
import Badge from '@/components/badge';
import ProgressBar from '@/components/progress-bar';
import SectionHeader from '@/components/section-header';
import JourneyItem from '@/components/journey-item';
import { ThemedText } from '@/components/themed-text';

import {
  fetchPrayerTimesByCity,
  fetchPrayerTimesByCoords,
  getCurrentAndNextPrayer,
  PrayerTimings,
} from '@/utils/prayerApi';

export function HomeScreen() {
  const theme = useTheme();

  // Location and Timing States
  const [city, setCity] = useState('London');
  const [country, setCountry] = useState('United Kingdom');
  const [method, setMethod] = useState(2);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimings | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [currentPrayerName, setCurrentPrayerName] = useState('...');
  const [nextPrayerName, setNextPrayerName] = useState('...');
  const [nextPrayerTime, setNextPrayerTime] = useState('...');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalWaitSeconds, setTotalWaitSeconds] = useState(1);
  const [progress, setProgress] = useState(0);

  // Load timings whenever the screen gains focus
  const loadSettingsAndTimings = async () => {
    setIsLoading(true);
    try {
      const storedCity = await AsyncStorage.getItem('prayer_city');
      const storedCountry = await AsyncStorage.getItem('prayer_country');
      const storedGPS = await AsyncStorage.getItem('prayer_use_gps');
      const storedMethod = await AsyncStorage.getItem('prayer_method');
      
      const currentMethod = storedMethod ? parseInt(storedMethod, 10) : 2;
      setMethod(currentMethod);
      
      let data;
      if (storedGPS === 'true') {
        const storedLat = await AsyncStorage.getItem('prayer_lat');
        const storedLng = await AsyncStorage.getItem('prayer_lng');
        if (storedLat && storedLng) {
          data = await fetchPrayerTimesByCoords(parseFloat(storedLat), parseFloat(storedLng), currentMethod);
          setCity(storedCity || 'Current Location');
          setCountry(storedCountry || '');
        }
      }
      
      if (!data) {
        const currentCity = storedCity || 'London';
        const currentCountry = storedCountry || 'United Kingdom';
        setCity(currentCity);
        setCountry(currentCountry);
        data = await fetchPrayerTimesByCity(currentCity, currentCountry, currentMethod);
      }
      
      setPrayerTimes(data.timings);
    } catch (err) {
      console.error('[HomeScreen] Error loading timings:', err);
      // Fallback
      try {
        const fallbackData = await fetchPrayerTimesByCity('London', 'United Kingdom', 2);
        setPrayerTimes(fallbackData.timings);
        setCity('London');
        setCountry('United Kingdom');
      } catch (fErr) {
        console.error('[HomeScreen] Fallback failed:', fErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSettingsAndTimings();
    }, [])
  );

  // Countdown timer interval
  useEffect(() => {
    if (!prayerTimes) return;

    const updateTimer = () => {
      const info = getCurrentAndNextPrayer(prayerTimes);
      setCurrentPrayerName(info.current);
      setNextPrayerName(info.next);
      setNextPrayerTime(info.nextTime);
      setSecondsLeft(info.secondsLeft);
      setTotalWaitSeconds(info.totalWaitSeconds);
      setProgress(info.progress);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  const formatCountdown = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current Prayer Card */}
        <Card variant="primary" style={styles.prayerCard}>
          <View style={styles.prayerHeader}>
            <Ionicons name="sunny-outline" size={16} color={theme.textOnPrimary} />
            <ThemedText style={styles.prayerSubtitle} themeColor="textOnPrimary">
              CURRENT PRAYER IN {city.toUpperCase()}
            </ThemedText>
          </View>

          {isLoading ? (
            <ActivityIndicator size="small" color={theme.textOnPrimary} style={{ marginVertical: Spacing.two }} />
          ) : (
            <ThemedText style={styles.prayerTitle} themeColor="textOnPrimary">
              {currentPrayerName}
            </ThemedText>
          )}

          <View style={styles.prayerTimeEnd}>
            <Ionicons name="time-outline" size={16} color={theme.textOnPrimary} />
            <ThemedText style={styles.prayerEndTimeText} themeColor="textOnPrimary">
              Ends at {nextPrayerTime}
            </ThemedText>
          </View>

          {/* Next Prayer Subcard */}
          <View style={[styles.nextPrayerContainer, { backgroundColor: theme.primaryDark }]}>
            <View style={styles.nextPrayerRow}>
              <ThemedText style={styles.nextPrayerLabel} themeColor="textOnPrimary">
                Next Prayer: <ThemedText style={styles.nextPrayerName} themeColor="textOnPrimary">{nextPrayerName}</ThemedText>
              </ThemedText>
            </View>

            <ThemedText style={styles.timerText} themeColor="textOnPrimary">
              {formatCountdown(secondsLeft)}
            </ThemedText>

            <ProgressBar
              progress={progress}
              height={6}
              trackColor={theme.primary + '50'}
              progressColor={theme.accent}
              style={styles.progressBar}
            />

            <ThemedText style={styles.quoteText} themeColor="textOnPrimary">
              "Prayer is the pillar of religion"
            </ThemedText>
          </View>
        </Card>

        {/* Daily Ayah Card */}
        <Card variant="elevated" style={styles.ayahCard}>
          <View style={styles.ayahHeader}>
            <Badge text="Daily Ayah" variant="primary" />
            <Pressable style={styles.bookmarkButton} onPress={() => router.push('/quran')}>
              <Ionicons name="book-outline" size={20} color={theme.primary} />
            </Pressable>
          </View>

          <ThemedText style={styles.arabicText}>
            فَإِنَّ مَعَ الْعُسْرِ يُسْرًا
          </ThemedText>

          <ThemedText style={styles.translationText} themeColor="textSecondary">
            "For indeed, with hardship [will be] ease."
          </ThemedText>

          <ThemedText style={styles.referenceText} themeColor="textSecondary">
            Surah Ash-Sharh [94:5]
          </ThemedText>

          <Pressable
            style={[styles.shareButton, { borderColor: theme.primary }]}
            onPress={() => router.push('/quran')}
          >
            <Ionicons name="open-outline" size={16} color={theme.primary} />
            <ThemedText style={[styles.shareButtonText, { color: theme.primary }]}>
              Read Quran
            </ThemedText>
          </Pressable>
        </Card>

        {/* Quick Actions (Qibla and Zakat) */}
        <View style={styles.quickActionsRow}>
          <Pressable style={styles.quickActionPressable} onPress={() => router.push('/qibla')}>
            <Card variant="outlined" style={styles.quickActionCard}>
              <View style={[styles.iconCircle, { backgroundColor: '#FDF2F2' }]}>
                <Ionicons name="compass-outline" size={24} color="#EF4444" />
              </View>
              <View style={styles.quickActionTextContainer}>
                <ThemedText style={styles.quickActionTitle}>Qibla</ThemedText>
                <ThemedText style={styles.quickActionSubtitle} themeColor="textSecondary">
                  Find the direction towards Kaaba
                </ThemedText>
              </View>
            </Card>
          </Pressable>

          <Pressable style={styles.quickActionPressable} onPress={() => router.push('/quran')}>
            <Card variant="outlined" style={styles.quickActionCard}>
              <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="book-outline" size={24} color="#10B981" />
              </View>
              <View style={styles.quickActionTextContainer}>
                <ThemedText style={styles.quickActionTitle}>Quran Audio</ThemedText>
                <ThemedText style={styles.quickActionSubtitle} themeColor="textSecondary">
                  Listen to recitations and read ayahs
                </ThemedText>
              </View>
            </Card>
          </Pressable>
        </View>

        {/* Spiritual Path Card */}
        <Card variant="primary" style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <ThemedText style={styles.streakTitle} themeColor="textOnPrimary">
              Spiritual Path
            </ThemedText>
            <Badge text="12 DAY STREAK" variant="accent" />
          </View>

          {/* Segmented indicator */}
          <View style={styles.segmentsRow}>
            <View style={[styles.segment, { backgroundColor: '#FFFFFF' }]} />
            <View style={[styles.segment, { backgroundColor: '#FFFFFF' }]} />
            <View style={[styles.segment, { backgroundColor: '#FFFFFF' }]} />
            <View style={[styles.segment, { backgroundColor: theme.primaryDark }]} />
            <View style={[styles.segment, { backgroundColor: theme.primaryDark }]} />
          </View>

          <ThemedText style={styles.streakTasksText} themeColor="textOnPrimary">
            3 tasks remaining for today.
          </ThemedText>
        </Card>

        {/* Your Journey Section */}
        <SectionHeader title="Your Journey" rightLabel="View All" onRightPress={() => router.push('/quran')} />

        <Pressable onPress={() => router.push('/quran')}>
          <JourneyItem
            progressValue="65%"
            subtitle="Surah Al-Baqarah"
            title="Reading Progress"
            type="progress"
          />
        </Pressable>

        <JourneyItem
          progressValue="33"
          subtitle="SubhanAllah"
          title="Daily Dhikr Goal"
          type="count"
        />

        <JourneyItem
          progressValue="♥"
          subtitle="Sadaqah Jariyah"
          title="Weekly Charity"
          type="progress"
        />

        {/* Spacer for bottom navigation inset */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 100, // Space for custom tab bar
  },
  prayerCard: {
    marginTop: Spacing.two,
  },
  prayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  prayerSubtitle: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  prayerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: Spacing.two,
  },
  prayerTimeEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginBottom: Spacing.four,
    opacity: 0.9,
  },
  prayerEndTimeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  nextPrayerContainer: {
    borderRadius: 16,
    padding: Spacing.four,
  },
  nextPrayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  nextPrayerLabel: {
    fontSize: 13,
    opacity: 0.8,
  },
  nextPrayerName: {
    fontWeight: 'bold',
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: Spacing.one,
    fontVariant: ['tabular-nums'],
  },
  progressBar: {
    marginVertical: Spacing.two,
  },
  quoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.7,
  },
  ayahCard: {
    marginVertical: Spacing.two,
    alignItems: 'center',
  },
  ayahHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  bookmarkButton: {
    padding: Spacing.one,
  },
  arabicText: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: Spacing.three,
    lineHeight: 40,
    fontFamily: 'serif',
  },
  translationText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
  referenceText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: Spacing.three,
    marginBottom: Spacing.four,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1.5,
    borderRadius: 24,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  shareButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  quickActionsRow: {
    flexDirection: 'column',
    gap: Spacing.two,
    marginVertical: Spacing.one,
  },
  quickActionPressable: {
    width: '100%',
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    gap: Spacing.three,
    marginVertical: 0,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionTextContainer: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickActionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  streakCard: {
    marginVertical: Spacing.two,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  segmentsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginVertical: Spacing.two,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  streakTasksText: {
    fontSize: 13,
    marginTop: Spacing.one,
    opacity: 0.9,
  },
  bottomSpacer: {
    height: 40,
  },
});
