import { MiniPlayer } from '@/components/mini-player';
import { Colors } from '@/constants/theme';
import { AudioProvider } from '@/context/audio-context';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { TranslationProvider } from '@/context/translation-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppBottomTabNavigator } from '@/navigation/bottom-tab';
import { ForgotPasswordScreen } from '@/screens/forgotPassword/ForgotPasswordScreen';
import { LocationSetupScreen } from '@/screens/locationSetup/LocationSetupScreen';
import { LoginScreen } from '@/screens/login/LoginScreen';
import { RegisterScreen } from '@/screens/register/RegisterScreen';
import { checkAndScheduleNotifications } from '@/utils/notifications';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

function RootNavigator() {
  const { token, location, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const [authScreen, setAuthScreen] = useState<'register' | 'login' | 'forgot-password'>('register');

  useEffect(() => {
    if (token && location) {
      checkAndScheduleNotifications(location);
    }
  }, [token, location]);

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!token) {
    if (authScreen === 'register') {
      return <RegisterScreen onGoToLogin={() => setAuthScreen('login')} />;
    }
    if (authScreen === 'forgot-password') {
      return <ForgotPasswordScreen onGoToLogin={() => setAuthScreen('login')} />;
    }
    return (
      <LoginScreen
        onGoToRegister={() => setAuthScreen('register')}
        onGoToForgotPassword={() => setAuthScreen('forgot-password')}
      />
    );
  }

  if (!location) {
    return <LocationSetupScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      <AppBottomTabNavigator />
      <MiniPlayer />
    </View>
  );
}

import { AlertProvider } from '@/context/alert-context';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <TranslationProvider>
        <AuthProvider>
          <AlertProvider>
            <AudioProvider>
              <RootNavigator />
            </AudioProvider>
          </AlertProvider>
        </AuthProvider>
      </TranslationProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
