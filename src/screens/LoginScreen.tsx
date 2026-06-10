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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { FormInput } from '@/components/auth/form-input';

interface LoginScreenProps {
  onGoToRegister: () => void;
  onGoToForgotPassword: () => void;
}

export function LoginScreen({ onGoToRegister, onGoToForgotPassword }: LoginScreenProps) {
  const theme = useTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errors: typeof fieldErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim() || !emailRegex.test(email.trim()))
      errors.email = 'Enter a valid email address';
    if (!password || password.length < 6)
      errors.password = 'Password must be at least 6 characters';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    setApiError(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setApiError(err.message || 'Login failed. Please check your credentials.');
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
          {/* Islamic crescent + star motif */}
          <View style={[styles.logoCircle, { backgroundColor: theme.primaryLight }]}>
            <Ionicons name="moon-outline" size={34} color={theme.primary} />
          </View>
          <ThemedText style={styles.appName} themeColor="text">
            Noor IslamicPro
          </ThemedText>
          <ThemedText style={styles.tagline} themeColor="textSecondary">
            Welcome back — sign in to continue
          </ThemedText>
        </Animated.View>

        {/* ── Form Card ── */}
        <Animated.View
          entering={FadeInDown.delay(160).duration(500)}
          style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
        >
          <ThemedText style={styles.cardTitle} themeColor="text">
            Sign In
          </ThemedText>

          {/* API Error Banner */}
          {apiError && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" />
              <ThemedText style={styles.errorBannerText}>{apiError}</ThemedText>
            </View>
          )}

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
            placeholder="Your password"
            value={password}
            onChangeText={(t) => { setPassword(t); setFieldErrors((e) => ({ ...e, password: undefined })); }}
            isPassword
            autoCapitalize="none"
            editable={!isLoading}
            error={fieldErrors.password}
          />

          <View style={styles.forgotPasswordRow}>
            <Pressable onPress={onGoToForgotPassword} disabled={isLoading} hitSlop={8}>
              <ThemedText style={[styles.forgotPasswordLink, { color: theme.primary }]}>
                Forgot Password?
              </ThemedText>
            </Pressable>
          </View>

          {/* Submit */}
          <Pressable
            style={({ pressed }) => [
              styles.submitBtn,
              { backgroundColor: theme.primary, opacity: pressed || isLoading ? 0.82 : 1 },
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={20} color="#fff" />
                <ThemedText style={styles.submitText} themeColor="textOnPrimary">
                  Sign In
                </ThemedText>
              </>
            )}
          </Pressable>

          {/* Divider */}
          <View style={[styles.divider, { borderColor: theme.border }]} />

          {/* Switch to Register */}
          <View style={styles.switchRow}>
            <ThemedText style={styles.switchLabel} themeColor="textSecondary">
              Don't have an account?
            </ThemedText>
            <Pressable onPress={onGoToRegister} disabled={isLoading} hitSlop={8}>
              <ThemedText style={[styles.switchLink, { color: theme.primary }]}>
                Register
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
  tagline: { fontSize: 13.5, textAlign: 'center', lineHeight: 20 },

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
  forgotPasswordRow: {
    alignItems: 'flex-end',
    marginBottom: Spacing.four,
    marginTop: -Spacing.one,
  },
  forgotPasswordLink: {
    fontSize: 13.5,
    fontWeight: '600',
  },
});
