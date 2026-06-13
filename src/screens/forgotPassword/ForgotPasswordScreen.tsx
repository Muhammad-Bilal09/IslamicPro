import { FormInput } from '@/components/auth/form-input';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { ForgotPasswordScreenProps } from '@/types/type';
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

import Animated, {
  FadeInDown,
  FadeInUp,
  Layout,
} from 'react-native-reanimated';

import { styles } from './ForgotStyle';
import { useForgotPassword } from './UseForgotPassword';

export function ForgotPasswordScreen({
  onGoToLogin,
}: ForgotPasswordScreenProps) {
  const theme = useTheme();

  const {
    step,
    setStep,

    email,
    setEmail,

    otp,
    setOtp,

    password,
    setPassword,

    confirmPassword,
    setConfirmPassword,

    isLoading,
    apiError,
    fieldErrors,

    resetErrorStates,

    handleSendOtp,
    handleVerifyOtp,
    handleResetPassword,
  } = useForgotPassword({ onGoToLogin });

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
      <Animated.View
        entering={FadeInUp.delay(80).duration(500)}
        style={styles.header}
      >
        <View
          style={[
            styles.logoCircle,
            { backgroundColor: theme.primaryLight },
          ]}
        >
          <Ionicons
            name={iconName}
            size={34}
            color={theme.primary}
          />
        </View>

        <ThemedText
          style={styles.appName}
          themeColor="text"
        >
          {title}
        </ThemedText>

        <ThemedText
          style={styles.tagline}
          themeColor="textSecondary"
        >
          {subtitle}
        </ThemedText>
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[
        styles.root,
        { backgroundColor: theme.background },
      ]}
    >
      <StatusBar
        barStyle={
          theme.background === '#0B0F19'
            ? 'light-content'
            : 'dark-content'
        }
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}

        <Animated.View
          layout={Layout.springify()}
          entering={FadeInDown.delay(160).duration(500)}
          style={[
            styles.card,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          {apiError && (
            <View style={styles.errorBanner}>
              <Ionicons
                name="alert-circle"
                size={16}
                color="#DC2626"
              />

              <ThemedText style={styles.errorBannerText}>
                {apiError}
              </ThemedText>
            </View>
          )}

          {step === 'send-otp' && (
            <View style={styles.stepContainer}>
              <FormInput
                label="Email Address"
                iconName="mail-outline"
                placeholder="name@domain.com"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  resetErrorStates();
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                error={fieldErrors.email}
              />

              <Pressable
                style={({ pressed }) => [
                  styles.submitBtn,
                  {
                    backgroundColor: theme.primary,
                    opacity:
                      pressed || isLoading ? 0.82 : 1,
                  },
                ]}
                onPress={handleSendOtp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name="paper-plane-outline"
                      size={20}
                      color="#fff"
                    />

                    <ThemedText
                      style={styles.submitText}
                      themeColor="textOnPrimary"
                    >
                      Send OTP Code
                    </ThemedText>
                  </>
                )}
              </Pressable>
            </View>
          )}

          {step === 'verify-otp' && (
            <View style={styles.stepContainer}>
              <FormInput
                label="Verification Code"
                iconName="key-outline"
                placeholder="e.g. 123456"
                value={otp}
                onChangeText={(t) => {
                  setOtp(
                    t
                      .replace(/[^0-9]/g, '')
                      .slice(0, 6)
                  );

                  resetErrorStates();
                }}
                keyboardType="number-pad"
                autoCapitalize="none"
                editable={!isLoading}
                error={fieldErrors.otp}
              />

              <View style={styles.actionRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.backBtn,
                    {
                      borderColor: theme.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                  onPress={() => {
                    setStep('send-otp');
                    resetErrorStates();
                  }}
                  disabled={isLoading}
                >
                  <ThemedText
                    style={[
                      styles.backBtnText,
                      {
                        color: theme.textSecondary,
                      },
                    ]}
                  >
                    Change Email
                  </ThemedText>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.primaryActionBtn,
                    {
                      backgroundColor: theme.primary,
                      opacity:
                        pressed || isLoading
                          ? 0.82
                          : 1,
                    },
                  ]}
                  onPress={handleVerifyOtp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <ThemedText
                      style={styles.submitText}
                      themeColor="textOnPrimary"
                    >
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
                <ThemedText
                  style={[
                    styles.resendText,
                    { color: theme.primary },
                  ]}
                >
                  Resend Verification Code
                </ThemedText>
              </Pressable>
            </View>
          )}

          {step === 'reset-password' && (
            <View style={styles.stepContainer}>
              <FormInput
                label="New Password"
                iconName="lock-closed-outline"
                placeholder="At least 6 characters"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  resetErrorStates();
                }}
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
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  resetErrorStates();
                }}
                isPassword
                autoCapitalize="none"
                editable={!isLoading}
                error={fieldErrors.confirmPassword}
              />

              <Pressable
                style={({ pressed }) => [
                  styles.submitBtn,
                  {
                    backgroundColor: theme.primary,
                    opacity:
                      pressed || isLoading ? 0.82 : 1,
                  },
                ]}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-done-circle-outline"
                      size={20}
                      color="#fff"
                    />

                    <ThemedText
                      style={styles.submitText}
                      themeColor="textOnPrimary"
                    >
                      Reset Password
                    </ThemedText>
                  </>
                )}
              </Pressable>
            </View>
          )}

          <View
            style={[
              styles.divider,
              { borderColor: theme.border },
            ]}
          />

          <View style={styles.switchRow}>
            <Pressable
              onPress={onGoToLogin}
              disabled={isLoading}
              hitSlop={8}
            >
              <ThemedText
                style={[
                  styles.switchLink,
                  { color: theme.primary },
                ]}
              >
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