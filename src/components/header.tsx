import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

import { useRouter } from 'expo-router';

export interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  onSearchPress?: () => void;
  onSettingsPress?: () => void;
  showAvatar?: boolean;
  avatarUrl?: string;
}

export function Header({
  title = 'Noor',
  showSearch = false,
  onSearchPress,
  onSettingsPress,
  showAvatar = true,
  avatarUrl,
}: HeaderProps) {
  const theme = useTheme();
  const router = useRouter();

  const handleSettingsPress = () => {
    if (onSettingsPress) {
      onSettingsPress();
    } else {
      router.push('/settings');
    }
  };

  const handleAvatarPress = () => {
    router.push('/profile');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.leftContainer}>
        {showAvatar && (
          <Pressable onPress={handleAvatarPress}>
            <View style={[styles.avatarContainer, { backgroundColor: theme.primaryLight }]}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={18} color={theme.primary} />
              )}
            </View>
          </Pressable>
        )}
        <ThemedText style={styles.titleText}>{title}</ThemedText>
      </View>

      <View style={styles.rightContainer}>
        {showSearch && (
          <Pressable onPress={onSearchPress} style={styles.iconButton}>
            <Ionicons name="search" size={24} color={theme.text} />
          </Pressable>
        )}
        <Pressable onPress={handleSettingsPress} style={styles.iconButton}>
          <Ionicons name="settings-outline" size={24} color={theme.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    height: 64,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  titleText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#094C3A',
    letterSpacing: -0.5,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  iconButton: {
    padding: Spacing.one,
    borderRadius: 20,
  },
});

export default Header;
