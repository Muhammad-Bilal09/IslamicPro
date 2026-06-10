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
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { FormInput } from '@/components/auth/form-input';
import { apiClient } from '@/utils/api';

interface ForgotPasswordScreenProps {
  onGoToLogin: () => void;
}

type ForgotStep = 'send-otp' | 'verify-otp' | 'reset-password';

export function ForgotPasswordScreen({ onGoToLogin }: ForgotPasswordScreenProps) {
  const theme = useTheme();

  const [step, setStep] = useState<ForgotStep>('send-otp');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    otp?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Clean errors when user changes inputs
  const resetErrorStates = () => {
    setApiError(null);
    setFieldErrors({});
  };

  const handleSendOtp = async () => {
    resetErrorStates();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setFieldErrors({ email: 'Enter a valid email address' });
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });
      
      Alert.alert(
        'OTP Sent',
        'A 6-digit verification code has been sent to your email address.',
        [{ text: 'OK' }]
      );
      setStep('verify-otp');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to send OTP. Please try again.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    resetErrorStates();
    if (!otp || otp.trim().length !== 6) {
      setFieldErrors({ otp: 'Enter the 6-digit verification code' });
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/verify-otp', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });
      setStep('reset-password');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Verification failed. Please try again.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    resetErrorStates();
    const errors: typeof fieldErrors = {};

    if (!password || password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        password: password,
      });

      Alert.alert(
        'Success',
        'Your password has been successfully reset. Please log in with your new credentials.',
        [{ text: 'Log In Now', onPress: () => onGoToLogin() }]
      );
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Password reset failed. Please try again.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeader = () => {
    let iconName: keyof typeof Ionicons.glyphMap = 'mail-outline';
    let title = 'Forgot Password';
    let subtitle = 'Recover your account details securely';

    if (step === 'verify-otp') {
      iconName = 'keypad-outline';
      title = 'Verify OTP';
      subtitle = `Enter the 6-digit code sent to ${email}`;
    } else if (step === 'reset-password') {
      iconName = 'shield-checkmark-outline';
      title = 'New Password';
      subtitle = 'Create a strong new password for your account';
    }

    return (
      <Animated.View entering={FadeInUp.delay(80).duration(500)} style={styles.header}>
        <View style={[styles.logoCircle, { backgroundColor: theme.primaryLight }]}>
          <Ionicons name={iconName} size={34} color={theme.primary} />
        </View>
        <ThemedText style={styles.appName} themeColor="text">
          {title}
        </ThemedText>
        <ThemedText style={styles.tagline} themeColor="textSecondary">
          {subtitle}
        </ThemedText>
      </Animated.View>
    );
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
        {/* Step-specific Header */}
        {renderHeader()}

        {/* Form Card */}
        <Animated.View
          layout={Layout.springify()}
          entering={FadeInDown.delay(160).duration(500)}
          style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
        >
          {/* API Error Banner */}
          {apiError && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" />
              <ThemedText style={styles.errorBannerText}>{apiError}</ThemedText>
            </View>
          )}

          {/* Step 1: Request OTP */}
          {step === 'send-otp' && (
            <View style={styles.stepContainer}>
              <FormInput
                label="Email Address"
                iconName="mail-outline"
                placeholder="name@domain.com"
                value={email}
                onChangeText={(t) => { setEmail(t); resetErrorStates(); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                error={fieldErrors.email}
              />

              <Pressable
                style={({ pressed }) => [
                  styles.submitBtn,
                  { backgroundColor: theme.primary, opacity: pressed || isLoading ? 0.82 : 1 },
                ]}
                onPress={handleSendOtp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="paper-plane-outline" size={20} color="#fff" />
                    <ThemedText style={styles.submitText} themeColor="textOnPrimary">
                      Send OTP Code
                    </ThemedText>
                  </>
                )}
              </Pressable>
            </View>
          )}

          {/* Step 2: Verify OTP */}
          {step === 'verify-otp' && (
            <View style={styles.stepContainer}>
              <FormInput
                label="Verification Code"
                iconName="key-outline"
                placeholder="e.g. 123456"
                value={otp}
                onChangeText={(t) => { setOtp(t.replace(/[^0-9]/g, '').slice(0, 6)); resetErrorStates(); }}
                keyboardType="number-pad"
                autoCapitalize="none"
                editable={!isLoading}
                error={fieldErrors.otp}
              />

              <View style={styles.actionRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.backBtn,
                    { borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={() => { setStep('send-otp'); resetErrorStates(); }}
                  disabled={isLoading}
                >
                  <ThemedText style={[styles.backBtnText, { color: theme.textSecondary }]}>
                    Change Email
                  </ThemedText>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.primaryActionBtn,
                    { backgroundColor: theme.primary, opacity: pressed || isLoading ? 0.82 : 1 },
                  ]}
                  onPress={handleVerifyOtp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <ThemedText style={styles.submitText} themeColor="textOnPrimary">
                      Verify OTP
                    </ThemedText>
                  )}
                </Pressable>
              </View>

              <Pressable
                style={styles.resendLink}
                onPress={handleSendOtp}
                disabled={isLoading}
              >
                <ThemedText style={[styles.resendText, { color: theme.primary }]}>
                  Resend Verification Code
                </ThemedText>
              </Pressable>
            </View>
          )}

          {/* Step 3: Enter New Password */}
          {step === 'reset-password' && (
            <View style={styles.stepContainer}>
              <FormInput
                label="New Password"
                iconName="lock-closed-outline"
                placeholder="At least 6 characters"
                value={password}
                onChangeText={(t) => { setPassword(t); resetErrorStates(); }}
                isPassword
                autoCapitalize="none"
                editable={!isLoading}
                error={fieldErrors.password}
              />

              <FormInput
                label="Confirm New Password"
                iconName="lock-closed-outline"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); resetErrorStates(); }}
                isPassword
                autoCapitalize="none"
                editable={!isLoading}
                error={fieldErrors.confirmPassword}
              />

              <Pressable
                style={({ pressed }) => [
                  styles.submitBtn,
                  { backgroundColor: theme.primary, opacity: pressed || isLoading ? 0.82 : 1 },
                ]}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-done-circle-outline" size={20} color="#fff" />
                    <ThemedText style={styles.submitText} themeColor="textOnPrimary">
                      Reset Password
                    </ThemedText>
                  </>
                )}
              </Pressable>
            </View>
          )}

          {/* Divider */}
          <View style={[styles.divider, { borderColor: theme.border }]} />

          {/* Back to Login */}
          <View style={styles.switchRow}>
            <Pressable onPress={onGoToLogin} disabled={isLoading} hitSlop={8}>
              <ThemedText style={[styles.switchLink, { color: theme.primary }]}>
                Back to Sign In
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
  stepContainer: {
    width: '100%',
  },

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

  /* Submit Buttons */
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

  /* Two-column action buttons */
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Spacing.two,
  },
  backBtn: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  primaryActionBtn: {
    flex: 1.3,
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },

  /* Resend Link */
  resendLink: {
    alignItems: 'center',
    marginTop: Spacing.four,
    paddingVertical: 4,
  },
  resendText: {
    fontSize: 13.5,
    fontWeight: '600',
  },

  /* Divider */
  divider: { borderTopWidth: 1, marginVertical: Spacing.four },

  /* Switch */
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  switchLink: { fontSize: 14, fontWeight: '700' },
});
