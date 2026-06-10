import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { FormInput } from '@/components/auth/form-input';

export function LocationSetupScreen() {
  const theme = useTheme();
  const { updateLocation, user } = useAuth();

  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [isSavingManual, setIsSavingManual] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [cityError, setCityError] = useState<string | null>(null);

  // Use GPS location
  const handleUseGPS = async () => {
    setGpsError(null);
    setIsGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGpsError('Location permission denied. Please set your city manually below.');
        setIsGpsLoading(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude: lat, longitude: lng } = position.coords;

      let detectedCity = 'Current Location';
      let detectedCountry = '';

      try {
        const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (results.length > 0) {
          detectedCity =
            results[0].city ||
            results[0].subregion ||
            results[0].district ||
            'Current Location';
          detectedCountry = results[0].country || '';
        }
      } catch {
        // Geocode failed, use coordinates directly
      }

      await updateLocation({
        city: detectedCity,
        country: detectedCountry,
        useGps: true,
        lat,
        lng,
      });
    } catch (err: any) {
      setGpsError(err.message || 'Failed to get location. Please set it manually.');
    } finally {
      setIsGpsLoading(false);
    }
  };

  // Save manual location
  const handleManualSave = async () => {
    setCityError(null);
    if (!city.trim()) {
      setCityError('City name is required');
      return;
    }

    setIsSavingManual(true);
    try {
      await updateLocation({
        city: city.trim(),
        country: country.trim() || 'Global',
        useGps: false,
      });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save location');
    } finally {
      setIsSavingManual(false);
    }
  };

  const isAnyLoading = isGpsLoading || isSavingManual;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar
        barStyle={theme.background === '#0B0F19' ? 'light-content' : 'dark-content'}
      />

      {/* ── Header ── */}
      <Animated.View entering={FadeInUp.delay(80).duration(500)} style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: theme.primaryLight }]}>
          <Ionicons name="location-outline" size={36} color={theme.primary} />
        </View>
        <ThemedText style={styles.greeting} themeColor="text">
          Assalamu Alaikum{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 🌙
        </ThemedText>
        <ThemedText style={styles.subtitle} themeColor="textSecondary">
          Allow us to detect your location so we can calculate accurate prayer times for you.
        </ThemedText>
      </Animated.View>

      {/* ── GPS Option Card ── */}
      <Animated.View
        entering={FadeInDown.delay(160).duration(500)}
        style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
      >
        <ThemedText style={styles.cardTitle} themeColor="text">
          Use GPS Location
        </ThemedText>
        <ThemedText style={styles.cardDesc} themeColor="textSecondary">
          Automatically detect your current city for precise prayer timings.
        </ThemedText>

        {gpsError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color="#DC2626" />
            <ThemedText style={styles.errorBannerText}>{gpsError}</ThemedText>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.gpsBtn,
            { backgroundColor: theme.primary, opacity: pressed || isGpsLoading ? 0.82 : 1 },
          ]}
          onPress={handleUseGPS}
          disabled={isAnyLoading}
        >
          {isGpsLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="navigate-outline" size={20} color="#fff" />
              <ThemedText style={styles.gpsBtnText} themeColor="textOnPrimary">
                Detect My Location
              </ThemedText>
            </>
          )}
        </Pressable>
      </Animated.View>

      {/* ── Divider ── */}
      <Animated.View entering={FadeInDown.delay(240).duration(500)} style={styles.orRow}>
        <View style={[styles.orLine, { backgroundColor: theme.border }]} />
        <ThemedText style={styles.orText} themeColor="textSecondary">
          OR
        </ThemedText>
        <View style={[styles.orLine, { backgroundColor: theme.border }]} />
      </Animated.View>

      {/* ── Manual Entry Card ── */}
      <Animated.View
        entering={FadeInDown.delay(320).duration(500)}
        style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
      >
        <ThemedText style={styles.cardTitle} themeColor="text">
          Set Location Manually
        </ThemedText>
        <ThemedText style={styles.cardDesc} themeColor="textSecondary">
          Enter your city and country to get prayer times.
        </ThemedText>

        <FormInput
          label="City Name"
          iconName="business-outline"
          placeholder="e.g. Lahore, Cairo, London"
          value={city}
          onChangeText={(t) => { setCity(t); setCityError(null); }}
          autoCapitalize="words"
          editable={!isAnyLoading}
          error={cityError}
        />

        <FormInput
          label="Country (Optional)"
          iconName="earth-outline"
          placeholder="e.g. Pakistan, Egypt, UK"
          value={country}
          onChangeText={setCountry}
          autoCapitalize="words"
          editable={!isAnyLoading}
        />

        <Pressable
          style={({ pressed }) => [
            styles.manualBtn,
            {
              backgroundColor: 'transparent',
              borderColor: theme.primary,
              opacity: pressed || isSavingManual ? 0.75 : 1,
            },
          ]}
          onPress={handleManualSave}
          disabled={isAnyLoading}
        >
          {isSavingManual ? (
            <ActivityIndicator color={theme.primary} />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color={theme.primary} />
              <ThemedText style={[styles.manualBtnText, { color: theme.primary }]}>
                Save &amp; Continue
              </ThemedText>
            </>
          )}
        </Pressable>
      </Animated.View>

      {/* ── Skip note ── */}
      <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.skipNote}>
        <Ionicons name="information-circle-outline" size={14} color={theme.textSecondary} />
        <ThemedText style={styles.skipText} themeColor="textSecondary">
          You can update your location anytime from the Prayer screen.
        </ThemedText>
      </Animated.View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, padding: Spacing.four, paddingTop: Spacing.six },

  /* Header */
  header: { alignItems: 'center', marginBottom: Spacing.five },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  greeting: { fontSize: 22, fontWeight: '800', marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 21, paddingHorizontal: Spacing.two },

  /* Cards */
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.four,
    marginBottom: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  cardDesc: { fontSize: 13, lineHeight: 19, marginBottom: Spacing.three },

  /* Error */
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: Spacing.three,
  },
  errorBannerText: { fontSize: 12.5, color: '#DC2626', flex: 1 },

  /* GPS Button */
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  gpsBtnText: { fontSize: 15, fontWeight: '700' },

  /* OR divider */
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: Spacing.two },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },

  /* Manual Button */
  manualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: Spacing.one,
  },
  manualBtnText: { fontSize: 15, fontWeight: '700' },

  /* Skip note */
  skipNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingHorizontal: Spacing.two,
    marginTop: Spacing.one,
  },
  skipText: { fontSize: 12, flex: 1, lineHeight: 18 },
});
