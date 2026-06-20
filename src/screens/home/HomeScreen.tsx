import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, View } from 'react-native';
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
import { useScreenData } from '@/hooks/UseScreenData';
import { styles } from './HomeStyle';
import { useHome } from './UseHome';

export function HomeScreen() {
  const theme = useTheme();
  const [cardHeight, setCardHeight] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);

  const imageHeight = cardHeight ? cardHeight * 2.45 : 0;
  const imageWidth = imageHeight;
  const finalWidth = cardWidth && imageWidth < cardWidth ? cardWidth : imageWidth;
  const finalHeight = finalWidth;
  const finalTop = cardHeight ? - (finalHeight - cardHeight) / 2 : 0;
  const {
    city,
    isLoading,
    currentPrayerName,
    nextPrayerName,
    nextPrayerTime,
    secondsLeft,
    progress,
    formatCountdown,
    dailyAyahData,
    isAyahLoading,
    isDailyAyahEnabled,
    ramadanCountdown,
    hijriDate,
  } = useHome();
  const { getRamadanCountdownItems, quickActions, journeyItems } = useScreenData();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={{ paddingHorizontal: Spacing.four, marginTop: Spacing.two, marginBottom: Spacing.half, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <ThemedText style={{ fontSize: 13, color: theme.textSecondary, fontWeight: '600' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </ThemedText>
          <ThemedText style={{ fontSize: 13, color: theme.primary, fontWeight: '700' }}>
            {hijriDate}
          </ThemedText>
        </View>

        <Card
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setCardWidth(width);
            setCardHeight(height);
          }}
          style={{
            marginTop: Spacing.one,
            marginBottom: Spacing.one,
            padding: Spacing.four,
            borderWidth: 1,
            borderColor: '#1E293B',
            backgroundColor: '#0B0F19',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {cardHeight > 0 && cardWidth > 0 && (
            <>
              <Image
                source={require('../../../assets/images/ramadan_bg.png')}
                style={{
                  position: 'absolute',
                  top: finalTop,
                  right: 0,
                  width: finalWidth,
                  height: finalHeight,
                }}
                resizeMode="contain"
              />
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                }}
              />
            </>
          )}
          <View style={{ gap: Spacing.three }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="moon" size={18} color="#FBBF24" />
                </View>
                <View>
                  <ThemedText style={{ fontWeight: '800', fontSize: 14, color: '#FFFFFF' }}>
                    Ramadan Coming Soon!
                  </ThemedText>
                  <ThemedText style={{ fontSize: 11, color: '#E2E8F0', marginTop: 1 }}>
                    Expected: Feb 8, 2027
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 6, marginTop: Spacing.one }}>
              {getRamadanCountdownItems(ramadanCountdown).map((item) => (
                <View
                  key={item.label}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    borderRadius: 12,
                    paddingVertical: 10,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.04,
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                >
                  <ThemedText
                    style={{
                      fontSize: 22,
                      fontWeight: '800',
                      color: '#FBBF24',
                      fontVariant: ['tabular-nums'],
                      marginBottom: 2,
                    }}
                  >
                    {String(item.value).padStart(2, '0')}
                  </ThemedText>
                  <ThemedText
                    style={{
                      fontSize: 9,
                      fontWeight: '700',
                      color: '#E2E8F0',
                      letterSpacing: 0.8,
                    }}
                  >
                    {item.label}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        </Card>

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

        {isDailyAyahEnabled && (
          <Card variant="elevated" style={styles.ayahCard}>
            <View style={styles.ayahHeader}>
              <Badge text="Daily Ayah" variant="primary" />
              <Pressable
                style={styles.bookmarkButton}
                onPress={() => router.push(`/surah/${dailyAyahData.surahNumber}`)}
              >
                <Ionicons name="book-outline" size={20} color={theme.primary} />
              </Pressable>
            </View>

            {isAyahLoading ? (
              <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: Spacing.four }} />
            ) : (
              <>
                <ThemedText style={styles.arabicText}>
                  {dailyAyahData.text}
                </ThemedText>

                <ThemedText style={styles.translationText} themeColor="textSecondary">
                  "{dailyAyahData.translation}"
                </ThemedText>

                <ThemedText style={styles.referenceText} themeColor="textSecondary">
                  Surah {dailyAyahData.surahName} [{dailyAyahData.surahNumber}:{dailyAyahData.numberInSurah}]
                </ThemedText>

                <Pressable
                  style={[styles.shareButton, { borderColor: theme.primary }]}
                  onPress={() => router.push(`/surah/${dailyAyahData.surahNumber}`)}
                >
                  <Ionicons name="open-outline" size={16} color={theme.primary} />
                  <ThemedText style={[styles.shareButtonText, { color: theme.primary }]}>
                    Read Quran
                  </ThemedText>
                </Pressable>
              </>
            )}
          </Card>
        )}

        <View style={styles.quickActionsRow}>
          {quickActions.map((action) => (
            <Pressable
              key={action.title}
              style={styles.quickActionPressable}
              onPress={() => router.push(action.route as any)}
            >
              <Card variant="outlined" style={styles.quickActionCard}>
                <View style={[styles.iconCircle, { backgroundColor: action.bgColor }]}>
                  <Ionicons name={action.icon} size={24} color={action.iconColor} />
                </View>
                <View style={styles.quickActionTextContainer}>
                  <ThemedText style={styles.quickActionTitle}>{action.title}</ThemedText>
                  <ThemedText style={styles.quickActionSubtitle} themeColor="textSecondary">
                    {action.subtitle}
                  </ThemedText>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>

        <SectionHeader title="Your Journey" rightLabel="View All" onRightPress={() => router.push('/quran')} />

        {journeyItems.map((item) => {
          const content = (
            <JourneyItem
              key={item.title}
              progressValue={item.progressValue}
              subtitle={item.subtitle}
              title={item.title}
              type={item.type}
            />
          );

          if (item.route) {
            return (
              <Pressable key={item.title} onPress={() => router.push(item.route as any)}>
                {content}
              </Pressable>
            );
          }

          return content;
        })}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default HomeScreen;
