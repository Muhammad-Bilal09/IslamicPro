import { MiniPlayer } from "@/components/mini-player";
import { Colors } from "@/constants/theme";
import { AudioProvider } from "@/context/audio-context";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { ConnectionProvider } from "@/context/connection-context";
import { TranslationProvider } from "@/context/translation-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppBottomTabNavigator } from "@/navigation/bottom-tab";
import { ForgotPasswordScreen } from "@/screens/forgotPassword/ForgotPasswordScreen";
import { LocationSetupScreen } from "@/screens/locationSetup/LocationSetupScreen";
import { LoginScreen } from "@/screens/login/LoginScreen";
import { RegisterScreen } from "@/screens/register/RegisterScreen";
import { checkAndScheduleNotifications, cleanupPastNotifications } from "@/utils/notifications";
import { initDatabase } from "@/utils/quranDb";
import * as Notifications from "expo-notifications";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { AppState, AppStateStatus, View } from "react-native";

import { useFonts } from "expo-font";

SplashScreen.preventAutoHideAsync().catch(() => {});

import { FCMManager } from "@/utils/FCMManager";
import { Analytics } from "@/utils/analytics";
import { TrackierManager } from "@/utils/TrackierManager";
import * as Linking from "expo-linking";

function RootNavigator() {
  const [fontsLoaded] = useFonts({
    "Amiri-Regular": require("../../assets/fonts/Amiri-Regular.ttf"),
    "ScheherazadeNew-Regular": require("../../assets/fonts/ScheherazadeNew-Regular.ttf"),
    "DigitalKhattIndoPak": require("../../assets/fonts/DigitalKhattIndoPak.ttf"),
  });
  const { user, token, location, isLoading } = useAuth();
  const [isAppReady, setIsAppReady] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const [authScreen, setAuthScreen] = useState<
    "register" | "login" | "forgot-password"
  >("register");

  useEffect(() => {
    const receivedSub = Notifications.addNotificationReceivedListener(
      async (notification) => {
        console.log(
          "[ExpoNotifications] Notification received:",
          notification.request.identifier,
        );
        const data: Record<string, any> =
          notification.request.content.data || {};
        if (typeof data.identifier === "string") {
          await FCMManager.markNotificationDeliveredLocally(data.identifier);
        }
      },
    );
    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log(
          "[ExpoNotifications] Notification response received:",
          response.notification.request.identifier,
        );
      },
    );

    cleanupPastNotifications().catch(() => {});
    FCMManager.registerFCMToken().catch(() => {});
    const removeTokenRefresh = FCMManager.setupTokenRefreshListener();

    return () => {
      receivedSub.remove();
      responseSub.remove();
      removeTokenRefresh();
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          console.log(
            "[RootLayout] App moved to foreground, checking scheduling/timezone...",
          );
          cleanupPastNotifications().catch(() => {});
          checkAndScheduleNotifications(null, false).catch((err) => {
            console.error(
              "[RootLayout] Error checking/scheduling notifications on foreground transition:",
              err,
            );
          });
          FCMManager.registerFCMToken().catch(() => {});
        }
      },
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      if (!isLoading && fontsLoaded) {
        try {
          await initDatabase();
          checkAndScheduleNotifications(null, true).catch(() => {});
        } catch (e) {
          console.warn("[RootLayout] Initialization failed:", e);
        } finally {
          setIsAppReady(true);
        }
      }
    };
    initializeApp();
  }, [isLoading, fontsLoaded]);

  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync().catch(() => {});
      Analytics.logEvent("app_open").catch(() => {});
      
      // Track initial UTM link launch
      Linking.getInitialURL()
        .then((url) => Analytics.trackUtmFromUrl(url))
        .catch(() => {});

      // Non-blocking Trackier install postback check
      TrackierManager.checkAndProcessInstallReferrer().catch((err) => {
        console.warn("[Trackier] Non-blocking install referrer error:", err);
      });
    }
  }, [isAppReady]);

  useEffect(() => {
    // Track incoming deep links with UTM parameters while app is active
    const subscription = Linking.addEventListener("url", (event) => {
      Analytics.trackUtmFromUrl(event.url).catch(() => {});
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    Analytics.setUserId(user?._id || null).catch(() => {});
  }, [user]);

  useEffect(() => {
    checkAndScheduleNotifications(location || null, false).catch(() => {});
  }, [token, location]);

  if (isLoading || !isAppReady) {
    return null;
  }

  if (!token) {
    if (authScreen === "register") {
      return <RegisterScreen onGoToLogin={() => setAuthScreen("login")} />;
    }
    if (authScreen === "forgot-password") {
      return (
        <ForgotPasswordScreen onGoToLogin={() => setAuthScreen("login")} />
      );
    }
    return (
      <LoginScreen
        onGoToRegister={() => setAuthScreen("register")}
        onGoToForgotPassword={() => setAuthScreen("forgot-password")}
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

import { AlertProvider } from "@/context/alert-context";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
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
