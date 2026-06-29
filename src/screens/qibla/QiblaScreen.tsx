import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Badge from '@/components/badge';
import Card from '@/components/card';
import Header from '@/components/header';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

import { COMPASS_SIZE, styles } from './QiblaStyle';
import { useQibla } from './UseQibla';

export function QiblaScreen() {
  const theme = useTheme();
  const {
    city,
    qiblaBearing,
    distance,
    isLoading,
    errorMsg,
    heading,
    hasMagnetometer,
    getCardinalDirection,
    forceRecalibrate,
    dialRotation,
    needleRotation,
    isAligned,
    guidanceText,
    guidanceAction,
  } = useQibla();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <Header title="Qibla Direction" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.titleContainer}>
          <ThemedText style={styles.mainTitle}>Qibla Finder</ThemedText>
          <ThemedText style={styles.subtitle} themeColor="textSecondary">
            {hasMagnetometer
              ? 'Rotate your phone as instructed below'
              : 'Align phone top to True North to find direction'}
          </ThemedText>
        </View>
        <View style={styles.compassWrapper}>
          <View
            style={[
              styles.glowRing,
              isAligned && {
                borderColor: '#10B981',
                borderWidth: 4,
                opacity: 0.15,
                backgroundColor: '#10B98115',
              },
              {
                width: COMPASS_SIZE + 24,
                height: COMPASS_SIZE + 24,
                borderRadius: (COMPASS_SIZE + 24) / 2,
              }
            ]}
          />

          <View
            style={[
              styles.outerDial,
              {
                width: COMPASS_SIZE,
                height: COMPASS_SIZE,
                borderRadius: COMPASS_SIZE / 2,
                borderColor: isAligned ? '#F59E0B' : theme.border,
                backgroundColor: theme.cardBackground,
                transform: [{ rotate: dialRotation }],
                borderWidth: isAligned ? 3 : 2,
              },
            ]}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.tickMark,
                  {
                    transform: [
                      { rotate: `${i * 30}deg` },
                      { translateY: -COMPASS_SIZE / 2 + 10 }
                    ],
                    backgroundColor: i === 0
                      ? '#EF4444'
                      : i % 3 === 0
                        ? theme.primary
                        : theme.border,
                    height: i % 3 === 0 ? 10 : 6,
                    width: i % 3 === 0 ? 2.5 : 1.5,
                  }
                ]}
              />
            ))}

            <ThemedText style={[styles.dirLabel, styles.north, { color: '#EF4444' }]}>N</ThemedText>
            <ThemedText style={[styles.dirLabel, styles.east, { color: theme.textSecondary }]}>E</ThemedText>
            <ThemedText style={[styles.dirLabel, styles.south, { color: theme.textSecondary }]}>S</ThemedText>
            <ThemedText style={[styles.dirLabel, styles.west, { color: theme.textSecondary }]}>W</ThemedText>

            <View
              style={[
                styles.innerDial,
                {
                  width: COMPASS_SIZE * 0.74,
                  height: COMPASS_SIZE * 0.74,
                  borderRadius: (COMPASS_SIZE * 0.74) / 2,
                  borderColor: isAligned ? '#10B981' : theme.border,
                  borderWidth: isAligned ? 2 : 1.5,
                },
              ]}
            >
              <View style={[styles.northNeedle, { transform: [{ rotate: '0deg' }] }]}>
                <View style={styles.northNeedleTop} />
                <View style={styles.northNeedleBottom} />
              </View>

              <View style={[styles.qiblaNeedle, { transform: [{ rotate: needleRotation }] }]}>
                <View style={[
                  styles.kaabaIconContainer,
                  isAligned && {
                    transform: [{ scale: 1.2 }],
                    backgroundColor: '#FEF3C7',
                    borderColor: '#F59E0B',
                    borderWidth: 1.5,
                  }
                ]}>
                  <ThemedText style={{ fontSize: isAligned ? 20 : 16 }}>🕋</ThemedText>
                </View>
                <View style={[
                  styles.qiblaNeedleTop,
                  { backgroundColor: isAligned ? '#F59E0B' : '#10B981' }
                ]} />
                <View style={styles.qiblaNeedleBottom} />
              </View>
              <View style={[
                styles.centerDot,
                {
                  backgroundColor: isAligned ? '#F59E0B' : theme.primary,
                  borderColor: theme.cardBackground
                }
              ]} />
            </View>
          </View>

          <View style={styles.badgeRow}>
            {isAligned ? (
              <Badge
                text="Qibla Aligned 🕌"
                variant="success"
                style={styles.headingBadge}
              />
            ) : (
              <Badge
                text={`${qiblaBearing}° ${getCardinalDirection(qiblaBearing)}`}
                variant="darkGreen"
                style={styles.headingBadge}
              />
            )}
          </View>

          {hasMagnetometer && (
            <ThemedText style={styles.deviceHeadingLabel} themeColor="textSecondary">
              Current heading: {heading}° {getCardinalDirection(heading)}
            </ThemedText>
          )}
        </View>

        <Card variant="elevated" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <View style={styles.infoIconRow}>
                <View style={[styles.infoIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="location" size={16} color="#B45309" />
                </View>
              </View>
              <ThemedText style={styles.infoLabel} themeColor="textSecondary">
                DISTANCE TO KAABA
              </ThemedText>
              <ThemedText style={styles.infoValue}>
                {distance.toLocaleString()} km
              </ThemedText>
            </View>

            <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />

            <View style={styles.infoCol}>
              <View style={styles.infoIconRow}>
                <View style={[styles.infoIcon, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="navigate" size={16} color={theme.primary} />
                </View>
              </View>
              <ThemedText style={styles.infoLabel} themeColor="textSecondary">
                YOUR LOCATION
              </ThemedText>
              <ThemedText style={styles.infoValue} numberOfLines={1}>
                {city}
              </ThemedText>
            </View>
          </View>
        </Card>

        <View style={styles.buttonRow}>
          <Pressable style={[styles.outlineBtn, { borderColor: theme.border, backgroundColor: theme.cardBackground }]} onPress={forceRecalibrate}>
            <Ionicons name="navigate-outline" size={20} color={theme.text} />
            <ThemedText style={styles.outlineBtnText}>Recalibrate GPS</ThemedText>
          </Pressable>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default QiblaScreen;
