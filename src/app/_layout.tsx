import { MiniPlayer } from '@/components/mini-player';
import { Colors } from '@/constants/theme';
import { AudioProvider } from '@/context/audio-context';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { ConnectionProvider } from '@/context/connection-context';
import { TranslationProvider } from '@/context/translation-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppBottomTabNavigator } from '@/navigation/bottom-tab';
import { ForgotPasswordScreen } from '@/screens/forgotPassword/ForgotPasswordScreen';
import { LocationSetupScreen } from '@/screens/locationSetup/LocationSetupScreen';
import { LoginScreen } from '@/screens/login/LoginScreen';
import { RegisterScreen } from '@/screens/register/RegisterScreen';
import { checkAndScheduleNotifications, registerBackgroundNotificationTask } from '@/utils/notifications';
import { initDatabase } from '@/utils/quranDb';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

SplashScreen.preventAutoHideAsync().catch(() => { });

function RootNavigator() {
  const { token, location, isLoading } = useAuth();
  const [isAppReady, setIsAppReady] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const [authScreen, setAuthScreen] = useState<'register' | 'login' | 'forgot-password'>('register');

  useEffect(() => {
    const initializeApp = async () => {
      if (!isLoading) {
        try {
          // Initialize and seed SQLite database offline from bundled JSON
          await initDatabase();
          // Register background fetch tasks
          await registerBackgroundNotificationTask();
          // Schedule notifications immediately on install / startup
          await checkAndScheduleNotifications(null, false);

          // Add a minimum delay of 3 seconds so splash screen can be tested visually
          await new Promise((resolve) => setTimeout(resolve, 3000));
        } catch (e) {
          console.warn('[RootLayout] Initialization failed:', e);
        } finally {
          setIsAppReady(true);
        }
      }
    };
    initializeApp();
  }, [isLoading]);

  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync().catch(() => { });
    }
  }, [isAppReady]);

  useEffect(() => {
    if (token && location) {
      checkAndScheduleNotifications(location);
    }
  }, [token, location]);

  if (isLoading || !isAppReady) {
    return null;
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
          <ConnectionProvider>
            <AlertProvider>
              <AudioProvider>
                <RootNavigator />
              </AudioProvider>
            </AlertProvider>
          </ConnectionProvider>
        </AuthProvider>
      </TranslationProvider>
    </ThemeProvider>
  );
}
