import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import Header from '@/components/header';
import Card from '@/components/card';
import Badge from '@/components/badge';
import { ThemedText } from '@/components/themed-text';

// Try to load expo-sensors Magnetometer safely
let SensorsModule: any = null;
try {
  SensorsModule = require('expo-sensors');
} catch (err) {
  console.warn('[QiblaScreen] expo-sensors is not supported on this platform:', err);
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const COMPASS_SIZE = Math.min(SCREEN_WIDTH - 80, 280);

export function QiblaScreen() {
  const theme = useTheme();

  // Location & Qibla direction State
  const [city, setCity] = useState('London, UK');
  const [qiblaBearing, setQiblaBearing] = useState(145); // Degrees from North
  const [distance, setDistance] = useState(4281); // distance in km
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Compass Heading State
  const [heading, setHeading] = useState(0);
  const [hasMagnetometer, setHasMagnetometer] = useState(false);

  // Calculate Qibla bearing & distance based on coordinates
  const calculateQiblaDirection = (lat: number, lng: number) => {
    const KAABA_LAT = 21.4225;
    const KAABA_LNG = 39.8262;

    const phi1 = (lat * Math.PI) / 180;
    const lambda1 = (lng * Math.PI) / 180;
    const phi2 = (KAABA_LAT * Math.PI) / 180;
    const lambda2 = (KAABA_LNG * Math.PI) / 180;

    const dLng = lambda2 - lambda1;
    const y = Math.sin(dLng);
    const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(dLng);
    
    let bearing = Math.atan2(y, x) * (180 / Math.PI);
    bearing = (bearing + 360) % 360;

    // Haversine distance
    const R = 6371; // Earth's radius in km
    const dLat = phi2 - phi1;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;

    setQiblaBearing(Math.round(bearing));
    setDistance(Math.round(dist));
  };

  const getCardinalDirection = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  // Fetch coordinates and calibrate location
  const calibrateLocation = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // 1. Check if location coordinates were already saved in AsyncStorage by the prayer screen
      const storedLat = await AsyncStorage.getItem('prayer_lat');
      const storedLng = await AsyncStorage.getItem('prayer_lng');
      const storedCity = await AsyncStorage.getItem('prayer_city');
      const storedCountry = await AsyncStorage.getItem('prayer_country');

      if (storedLat && storedLng) {
        const lat = parseFloat(storedLat);
        const lng = parseFloat(storedLng);
        const displayName = storedCountry ? `${storedCity}, ${storedCountry}` : `${storedCity}`;
        setCity(displayName);
        calculateQiblaDirection(lat, lng);
        setIsLoading(false);
        return;
      }

      // 2. Otherwise request live location GPS permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission denied. Defaulting to London coordinates.');
        // Default to London, UK
        setCity('London, UK');
        calculateQiblaDirection(51.5074, -0.1278);
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const lat = location.coords.latitude;
      const lng = location.coords.longitude;

      // Reverse geocode to detect city name
      let detectedCity = 'Current Location';
      try {
        const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (geocode && geocode.length > 0) {
          const item = geocode[0];
          detectedCity = item.city || item.subregion || item.district || 'Current Location';
          if (item.country) {
            detectedCity += `, ${item.country}`;
          }
        }
      } catch (geoErr) {
        console.warn('[QiblaScreen] Reverse geocoding failed:', geoErr);
      }

      setCity(detectedCity);
      calculateQiblaDirection(lat, lng);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to detect location coordinates.');
      // Default fallback
      setCity('London, UK');
      calculateQiblaDirection(51.5074, -0.1278);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-run calibration when clicking "Recalibrate" (clearing cache and getting fresh live GPS)
  const forceRecalibrate = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission denied.');
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      const lat = location.coords.latitude;
      const lng = location.coords.longitude;

      let detectedCity = 'Current Location';
      try {
        const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (geocode && geocode.length > 0) {
          const item = geocode[0];
          detectedCity = item.city || item.subregion || item.district || 'Current Location';
          if (item.country) {
            detectedCity += `, ${item.country}`;
          }
        }
      } catch (geoErr) {
        console.warn(geoErr);
      }

      setCity(detectedCity);
      calculateQiblaDirection(lat, lng);

      // Save to cache so other tabs sync
      await AsyncStorage.setItem('prayer_city', geocodeCityOnly(detectedCity));
      await AsyncStorage.setItem('prayer_country', geocodeCountryOnly(detectedCity));
      await AsyncStorage.setItem('prayer_lat', lat.toString());
      await AsyncStorage.setItem('prayer_lng', lng.toString());
      await AsyncStorage.setItem('prayer_use_gps', 'true');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to recalibrate GPS coordinates.');
    } finally {
      setIsLoading(false);
    }
  };

  const geocodeCityOnly = (str: string) => str.split(',')[0].trim();
  const geocodeCountryOnly = (str: string) => {
    const parts = str.split(',');
    return parts.length > 1 ? parts[1].trim() : '';
  };

  // Set up Location and Magnetometer Subscription
  useEffect(() => {
    calibrateLocation();

    let subscription: any = null;

    if (SensorsModule && SensorsModule.Magnetometer) {
      SensorsModule.Magnetometer.isAvailableAsync()
        .then((available: boolean) => {
          setHasMagnetometer(available);
          if (available) {
            SensorsModule.Magnetometer.setUpdateInterval(100);
            subscription = SensorsModule.Magnetometer.addListener((data: any) => {
              // Formula to calculate heading from magnetometer values
              let { x, y } = data;
              let angle = Math.atan2(y, x) * (180 / Math.PI);
              let headingDeg = Math.round(angle);
              if (headingDeg < 0) headingDeg += 360;
              
              // Normalize so North is 0
              setHeading(headingDeg);
            });
          }
        })
        .catch((err: any) => {
          console.warn('[QiblaScreen] Magnetometer is not available:', err);
        });
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Compute needle angle and dial angles based on orientation
  // Dial rotates in opposite direction of phone's heading to stay oriented to north.
  const dialRotation = hasMagnetometer ? `${360 - heading}deg` : '0deg';
  // Needle rotates relative to the phone's top to face the Kaaba (Bearing - Heading)
  const needleRotation = hasMagnetometer
    ? `${(qiblaBearing - heading + 360) % 360}deg`
    : `${qiblaBearing}deg`;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <Header title="Noor" />
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

export default QiblaScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    paddingBottom: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
    gap: 4,
    paddingHorizontal: Spacing.two,
  },
  mainTitle: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { fontSize: 13, textAlign: 'center', lineHeight: 18 },

  loader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: Spacing.two,
  },
  loaderText: {
    fontSize: 13,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    padding: Spacing.three,
    marginVertical: Spacing.two,
    width: '100%',
  },
  errorText: {
    fontSize: 12,
    color: '#991B1B',
    flex: 1,
  },

  /* Compass */
  compassWrapper: {
    alignItems: 'center',
    marginVertical: Spacing.four,
    paddingBottom: Spacing.two,
  },
  outerDial: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  dirLabel: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  north: { top: 14 },
  east: { right: 18 },
  south: { bottom: 14 },
  west: { left: 18 },
  innerDial: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  needle: {
    position: 'absolute',
    width: 16,
    height: '75%',
    alignItems: 'center',
  },
  needleTop: {
    width: 14,
    height: '50%',
    backgroundColor: '#854D0E',
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
  },
  needleBottom: {
    width: 8,
    height: '50%',
    backgroundColor: '#C4A882',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  centerDot: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    zIndex: 10,
  },
  headingBadge: {
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.two,
  },
  deviceHeadingLabel: {
    fontSize: 11,
    marginTop: 8,
    fontWeight: '500',
  },

  /* Info Card */
  infoCard: {
    width: '100%',
    padding: Spacing.four,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoCol: {
    flex: 1,
    gap: 4,
  },
  infoIconRow: {
    marginBottom: Spacing.one,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoDivider: {
    width: 1,
    alignSelf: 'stretch',
    marginHorizontal: Spacing.three,
  },

  /* Buttons */
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    width: '100%',
    marginTop: Spacing.four,
  },
  outlineBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
  },
  outlineBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  sensorWarningCard: {
    flexDirection: 'row',
    padding: Spacing.three,
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.four,
    width: '100%',
    backgroundColor: '#F8FAFC',
  },
  warningText: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
});
