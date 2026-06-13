import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { AppBottomTabNavigator } from '@/navigation/bottom-tab';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { RegisterScreen } from '@/screens/register/RegisterScreen';
import { LoginScreen } from '@/screens/login/LoginScreen';
import { ForgotPasswordScreen } from '@/screens/forgotPassword/ForgotPasswordScreen';
import { LocationSetupScreen } from '@/screens/locationSetup/LocationSetupScreen';
import { Colors } from '@/constants/theme';
import { checkAndScheduleNotifications } from '@/utils/notifications';

// Inner component that reads auth context
function RootNavigator() {
  const { token, location, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const [authScreen, setAuthScreen] = useState<'register' | 'login' | 'forgot-password'>('register');

  // Trigger prayer notification checks once location is loaded and token exists
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

  return <AppBottomTabNavigator />;
}

import { AlertProvider } from '@/context/alert-context';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AlertProvider>
          <RootNavigator />
        </AlertProvider>
      </AuthProvider>
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
