import { FormInput } from '@/components/auth/form-input';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { RegisterScreenProps } from '@/types/type';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { styles } from './RegisterStyle';
import { useRegister } from './UseRegister';

export function RegisterScreen({ onGoToLogin }: RegisterScreenProps) {
  const theme = useTheme();
  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    isGuestLoading,
    apiError,
    fieldErrors,
    setFieldErrors,
    handleRegister,
    handleContinueAsGuest,
  } = useRegister({ onGoToLogin });

  const isAnyLoading = isLoading || isGuestLoading;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.root, { backgroundColor: theme.background }]}
    >
      <StatusBar
        barStyle={theme.background === '#0B0F19' ? 'light-content' : 'dark-content'}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(80).duration(500)} style={styles.header}>
          <View style={[styles.logoCircle, { backgroundColor: theme.primaryLight, overflow: 'hidden' }]}>
            <Image
              source={require('../../../assets/images/icon.png')}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>
          <ThemedText style={styles.tagline} themeColor="textSecondary">
            Create an account to begin your spiritual journey
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(160).duration(500)}
          style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
        >
          <ThemedText style={styles.cardTitle} themeColor="text">
            Create Account
          </ThemedText>

          {apiError && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" />
              <ThemedText style={styles.errorBannerText}>{apiError}</ThemedText>
            </View>
          )}

          <FormInput
            label="Full Name"
            iconName="person-outline"
            placeholder="e.g. Bilal Ahmed"
            value={name}
            onChangeText={(t) => { setName(t); setFieldErrors((e) => ({ ...e, name: undefined })); }}
            autoCapitalize="words"
            editable={!isAnyLoading}
            error={fieldErrors.name}
          />

          <FormInput
            label="Email Address"
            iconName="mail-outline"
            placeholder="name@domain.com"
            value={email}
            onChangeText={(t) => { setEmail(t); setFieldErrors((e) => ({ ...e, email: undefined })); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isAnyLoading}
            error={fieldErrors.email}
          />

          <FormInput
            label="Password"
            iconName="lock-closed-outline"
            placeholder="At least 6 characters"
            value={password}
            onChangeText={(t) => { setPassword(t); setFieldErrors((e) => ({ ...e, password: undefined })); }}
            isPassword
            autoCapitalize="none"
            editable={!isAnyLoading}
            error={fieldErrors.password}
          />

          <FormInput
            label="Confirm Password"
            iconName="lock-closed-outline"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChangeText={(t) => { setConfirmPassword(t); setFieldErrors((e) => ({ ...e, confirmPassword: undefined })); }}
            isPassword
            autoCapitalize="none"
            editable={!isAnyLoading}
            error={fieldErrors.confirmPassword}
          />

          <Pressable
            style={({ pressed }) => [
              styles.submitBtn,
              { backgroundColor: theme.primary, opacity: pressed || isAnyLoading ? 0.82 : 1 },
            ]}
            onPress={handleRegister}
            disabled={isAnyLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <ThemedText style={styles.submitText} themeColor="textOnPrimary">
                  Create Account
                </ThemedText>
              </>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.guestBtn,
              {
                backgroundColor: theme.primaryLight,
                opacity: pressed || isAnyLoading ? 0.82 : 1,
              },
            ]}
            onPress={handleContinueAsGuest}
            disabled={isAnyLoading}
          >
            {isGuestLoading ? (
              <ActivityIndicator color={theme.primary} />
            ) : (
              <>
                <Ionicons name="person-outline" size={20} color={theme.primary} />
                <ThemedText style={[styles.guestBtnText, { color: theme.primary }]}>
                  Continue as Guest
                </ThemedText>
              </>
            )}
          </Pressable>

          <View style={[styles.divider, { borderColor: theme.border }]} />

          <View style={styles.switchRow}>
            <ThemedText style={styles.switchLabel} themeColor="textSecondary">
              Already have an account?
            </ThemedText>
            <Pressable onPress={onGoToLogin} disabled={isAnyLoading} hitSlop={8}>
              <ThemedText style={[styles.switchLink, { color: theme.primary }]}>
                Sign In
              </ThemedText>
            </Pressable>
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
export default RegisterScreen;
