import { FormInput } from '@/components/auth/form-input';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { LoginScreenProps } from '@/types/type';
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
import { useLogin } from './UseLogin';
import { styles } from './LoginStyle';

export function LoginScreen({ onGoToRegister, onGoToForgotPassword }: LoginScreenProps) {
  const theme = useTheme();
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    apiError,
    fieldErrors,
    setFieldErrors,
    handleLogin,
  } = useLogin({ onGoToRegister, onGoToForgotPassword });

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
            <Ionicons name="moon-outline" size={34} color={theme.primary} />
          </View>
          <ThemedText style={styles.appName} themeColor="text">
            IslamicPro
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

export default LoginScreen;
