import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { FormInput } from '@/components/auth/form-input';

interface RegisterScreenProps {
  onGoToLogin: () => void;
}

export function RegisterScreen({ onGoToLogin }: RegisterScreenProps) {
  const theme = useTheme();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const errors: typeof fieldErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) errors.name = 'Full name is required';
    if (!email.trim() || !emailRegex.test(email.trim()))
      errors.email = 'Enter a valid email address';
    if (!password || password.length < 6)
      errors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword)
      errors.confirmPassword = 'Passwords do not match';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    setApiError(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      Alert.alert(
        'Account Created',
        'Your account has been successfully created. Please sign in with your email and password.',
        [{ text: 'OK', onPress: () => onGoToLogin() }]
      );
    } catch (err: any) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
            Noor IslamicPro
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

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.four },

  /* Header */
  header: { alignItems: 'center', marginBottom: Spacing.five },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  appName: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  tagline: { fontSize: 13.5, textAlign: 'center', lineHeight: 20, paddingHorizontal: Spacing.four },

  /* Card */
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: Spacing.five,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', marginBottom: Spacing.four },

  /* Error banner */
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: Spacing.three,
  },
  errorBannerText: { fontSize: 13, color: '#DC2626', flex: 1 },

  /* Submit */
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: 14,
    marginTop: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  submitText: { fontSize: 15.5, fontWeight: '700' },

  /* Divider */
  divider: { borderTopWidth: 1, marginVertical: Spacing.four },

  /* Switch */
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  switchLabel: { fontSize: 13.5 },
  switchLink: { fontSize: 13.5, fontWeight: '700' },
});
