import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export function AppStackNavigator() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.textOnPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="prayer" options={{ headerShown: false }} />
      <Stack.Screen name="quran" options={{ headerShown: false }} />
      <Stack.Screen name="qibla" options={{ headerShown: false }} />
      <Stack.Screen name="more" options={{ headerShown: false }} />
    </Stack>
  );
}

export default AppStackNavigator;
