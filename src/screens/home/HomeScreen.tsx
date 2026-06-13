import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Badge from '@/components/badge';
import Card from '@/components/card';
import Header from '@/components/header';
import JourneyItem from '@/components/journey-item';
import ProgressBar from '@/components/progress-bar';
import SectionHeader from '@/components/section-header';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { styles } from './HomeStyle';
import { useHome } from './UseHome';

export function HomeScreen() {
  const theme = useTheme();
  const {
    city,
    isLoading,
    currentPrayerName,
    nextPrayerName,
    nextPrayerTime,
    secondsLeft,
    progress,
    formatCountdown,
  } = useHome();

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

        <Card variant="primary" style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <ThemedText style={styles.streakTitle} themeColor="textOnPrimary">
              Spiritual Path
            </ThemedText>
            <Badge text="12 DAY STREAK" variant="accent" />
          </View>

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
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default HomeScreen;
