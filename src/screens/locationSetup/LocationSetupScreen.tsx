import { FormInput } from '@/components/auth/form-input';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { styles } from './LocationSetupStyle';
import { useLocationSetup } from './UseLocationSetup';

export function LocationSetupScreen() {
  const theme = useTheme();
  const {
    user,
    isGpsLoading,
    isSavingManual,
    gpsError,
    city,
    setCity,
    country,
    setCountry,
    cityError,
    setCityError,
    handleUseGPS,
    handleManualSave,
    isAnyLoading,
  } = useLocationSetup();

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

      <Animated.View entering={FadeInDown.delay(240).duration(500)} style={styles.orRow}>
        <View style={[styles.orLine, { backgroundColor: theme.border }]} />
        <ThemedText style={styles.orText} themeColor="textSecondary">
          OR
        </ThemedText>
        <View style={[styles.orLine, { backgroundColor: theme.border }]} />
      </Animated.View>

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

export default LocationSetupScreen;
