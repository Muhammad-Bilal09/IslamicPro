import { FormInput } from '@/components/auth/form-input';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { RegisterScreenProps } from '@/types/type';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useRegister } from './UseRegister';
import { styles } from './RegisterStyle';

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
    apiError,
    fieldErrors,
    setFieldErrors,
    handleRegister,
  } = useRegister({ onGoToLogin });

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
        {/* ── Header ── */}
        <Animated.View entering={FadeInUp.delay(80).duration(500)} style={styles.header}>
          <View style={[styles.logoCircle, { backgroundColor: theme.primaryLight }]}>
            <Ionicons name="person-add-outline" size={34} color={theme.primary} />
          </View>
          <ThemedText style={styles.appName} themeColor="text">
            IslamicPro
          </ThemedText>
          <ThemedText style={styles.tagline} themeColor="textSecondary">
            Create an account to begin your spiritual journey
          </ThemedText>
        </Animated.View>

        {/* ── Form Card ── */}
        <Animated.View
          entering={FadeInDown.delay(160).duration(500)}
          style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
        >
          <ThemedText style={styles.cardTitle} themeColor="text">
            Create Account
          </ThemedText>

          {/* API Error Banner */}
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
            editable={!isLoading}
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
            editable={!isLoading}
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
            editable={!isLoading}
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
            editable={!isLoading}
            error={fieldErrors.confirmPassword}
          />

          {/* Submit */}
          <Pressable
            style={({ pressed }) => [
              styles.submitBtn,
              { backgroundColor: theme.primary, opacity: pressed || isLoading ? 0.82 : 1 },
            ]}
            onPress={handleRegister}
            disabled={isLoading}
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

          {/* Divider */}
          <View style={[styles.divider, { borderColor: theme.border }]} />

          {/* Switch to Login */}
          <View style={styles.switchRow}>
            <ThemedText style={styles.switchLabel} themeColor="textSecondary">
              Already have an account?
            </ThemedText>
            <Pressable onPress={onGoToLogin} disabled={isLoading} hitSlop={8}>
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
