import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Badge from '@/components/badge';
import Card from '@/components/card';
import Header from '@/components/header';
import { ThemedText } from '@/components/themed-text';

import { useQibla } from './UseQibla';
import { styles, COMPASS_SIZE } from './QiblaStyle';

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
  } = useQibla();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <Header title="Qibla Direction" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title */}
        <View style={styles.titleContainer}>
          <ThemedText style={styles.mainTitle}>Qibla Finder</ThemedText>
          <ThemedText style={styles.subtitle} themeColor="textSecondary">
            {hasMagnetometer
              ? 'Rotate your phone until the needle points straight up'
              : 'Align phone top to True North to find direction'}
          </ThemedText>
        </View>

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loader}>
            <ActivityIndicator size="small" color={theme.primary} />
            <ThemedText style={styles.loaderText} themeColor="textSecondary">Calibrating position...</ThemedText>
          </View>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <Card variant="outlined" style={styles.errorCard}>
            <Ionicons name="alert-circle" size={18} color={theme.accent} />
            <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>
          </Card>
        )}

        {/* Compass Dial wrapper */}
        <View style={styles.compassWrapper}>
          {/* Compass Dial */}
          <View
            style={[
              styles.outerDial,
              {
                width: COMPASS_SIZE,
                height: COMPASS_SIZE,
                borderRadius: COMPASS_SIZE / 2,
                borderColor: theme.border,
                backgroundColor: theme.cardBackground,
                transform: [{ rotate: dialRotation }],
              },
            ]}
          >
            {/* Direction Labels */}
            <ThemedText style={[styles.dirLabel, styles.north, { color: theme.primary }]}>N</ThemedText>
            <ThemedText style={[styles.dirLabel, styles.east]}>E</ThemedText>
            <ThemedText style={[styles.dirLabel, styles.south]}>S</ThemedText>
            <ThemedText style={[styles.dirLabel, styles.west]}>W</ThemedText>

            {/* Inner Ring */}
            <View
              style={[
                styles.innerDial,
                {
                  width: COMPASS_SIZE * 0.72,
                  height: COMPASS_SIZE * 0.72,
                  borderRadius: (COMPASS_SIZE * 0.72) / 2,
                  borderColor: theme.border,
                },
              ]}
            >
              {/* Needle pointer */}
              <View style={[styles.needle, { transform: [{ rotate: needleRotation }] }]}>
                <View style={styles.needleTop} />
                <View style={styles.needleBottom} />
              </View>
              {/* Center dot */}
              <View style={[styles.centerDot, { backgroundColor: '#854D0E', borderColor: theme.cardBackground }]} />
            </View>
          </View>

          {/* Direction Badge */}
          <Badge
            text={`${qiblaBearing}° ${getCardinalDirection(qiblaBearing)}`}
            variant="darkGreen"
            style={styles.headingBadge}
          />

          {hasMagnetometer && (
            <ThemedText style={styles.deviceHeadingLabel} themeColor="textSecondary">
              Current heading: {heading}° {getCardinalDirection(heading)}
            </ThemedText>
          )}
        </View>

        {/* Info Card */}
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

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <Pressable style={[styles.outlineBtn, { borderColor: theme.border, backgroundColor: theme.cardBackground }]} onPress={forceRecalibrate}>
            <Ionicons name="navigate-outline" size={20} color={theme.text} />
            <ThemedText style={styles.outlineBtnText}>Recalibrate GPS</ThemedText>
          </Pressable>
        </View>

        {/* Warning instructions */}
        {!hasMagnetometer && (
          <Card variant="outlined" style={styles.sensorWarningCard}>
            <Ionicons name="information-circle-outline" size={20} color={theme.textSecondary} />
            <ThemedText style={styles.warningText} themeColor="textSecondary">
              Compass sensors (magnetometer) not detected on this client. Dial is statically facing North. Place phone flat and align the Top of phone to North.
            </ThemedText>
          </Card>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Ensure theme hooks work
import { useTheme } from '@/hooks/use-theme';

export default QiblaScreen;
