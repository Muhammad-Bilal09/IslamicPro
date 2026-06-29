import { useAudio } from '@/context/audio-context';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalSearchParams, usePathname } from 'expo-router';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';
import Card from './card';
import { ThemedText } from './themed-text';

export function MiniPlayer() {
  const theme = useTheme();
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const {
    isPlaying,
    isLoadingAudio,
    currentAyahIndex,
    playingContext,
    togglePlayPause,
    stopAudio,
    handleNext,
  } = useAudio();

  if (currentAyahIndex === null || !playingContext.type) {
    return null;
  }

  const isCurrentlyOnActiveDetailScreen = () => {
    const currentIdStr = params.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : '';
    const playingIdStr = playingContext.id ? playingContext.id.toString() : '';

    if (playingContext.type === 'surah' && pathname.startsWith('/surah/')) {
      return currentIdStr === playingIdStr;
    }
    if (playingContext.type === 'juz' && pathname.startsWith('/parah/')) {
      return currentIdStr === playingIdStr;
    }
    return false;
  };

  if (isCurrentlyOnActiveDetailScreen()) {
    return null;
  }

  const hasTabBar =
    pathname === '/' ||
    pathname === '/prayer' ||
    pathname === '/quran' ||
    pathname === '/qibla' ||
    pathname === '/more' ||
    pathname === '/settings' ||
    pathname === '/profile';

  const bottomOffset = hasTabBar
    ? Platform.OS === 'ios' ? 100 : 90
    : Platform.OS === 'ios' ? 30 : 20;

  return (
    <Card
      style={[
        styles.container,
        {
          bottom: bottomOffset,
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
          shadowColor: theme.text,
        },
      ]}
    >
      <View style={styles.contentRow}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.primaryLight },
          ]}
        >
          <Ionicons name="musical-notes" size={18} color={theme.primary} />
        </View>

        <View style={styles.metaContainer}>
          <ThemedText style={styles.titleText} numberOfLines={1}>
            {playingContext.title}
          </ThemedText>
          <ThemedText style={styles.subtitleText} themeColor="textSecondary" numberOfLines={1}>
            Ayah {currentAyahIndex + 1} • Qari Mishary Alafasy
          </ThemedText>
        </View>

        <View style={styles.controlsContainer}>
          <Pressable
            style={[styles.btn, { borderColor: theme.border }]}
            onPress={handleNext}
          >
            <Ionicons name="play-skip-forward" size={16} color={theme.text} />
          </Pressable>

          <Pressable
            style={[styles.playBtn, { backgroundColor: theme.primary }]}
            onPress={togglePlayPause}
          >
            {isLoadingAudio ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={18}
                color="#FFFFFF"
                style={{ marginLeft: isPlaying ? 0 : 2 }}
              />
            )}
          </Pressable>

          <Pressable style={styles.closeBtn} onPress={stopAudio}>
            <Ionicons name="close" size={18} color={theme.textSecondary} />
          </Pressable>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginVertical: 0,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  metaContainer: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 10,
  },
  titleText: {
    fontWeight: '700',
    fontSize: 13,
  },
  subtitleText: {
    fontSize: 10.5,
    marginTop: 1,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    padding: 4,
    marginLeft: 2,
  },
});
