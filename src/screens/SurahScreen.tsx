import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { quranApi } from '@/utils/api';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Badge from '@/components/badge';
import Card from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface UnifiedAyah {
  number: number;
  numberInSurah: number;
  text: string;
  translation: string;
  audio: string;
}

interface SurahInfo {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
}

export function SurahScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const surahId = parseInt(Array.isArray(id) ? id[0] : id, 10);

  // ── Screen data state ─────────────────────────────────────────────────────
  const [surahInfo, setSurahInfo] = useState<SurahInfo | null>(null);
  const [ayahs, setAyahs] = useState<UnifiedAyah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ── Audio playback state ──────────────────────────────────────────────────
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);

  // Stale-closure-safe refs
  const currentAyahIndexRef = useRef<number | null>(null);
  const ayahsRef = useRef<UnifiedAyah[]>([]);
  const autoAdvanceRef = useRef(true);

  useEffect(() => { ayahsRef.current = ayahs; }, [ayahs]);
  useEffect(() => { autoAdvanceRef.current = autoAdvance; }, [autoAdvance]);
  useEffect(() => { currentAyahIndexRef.current = currentAyahIndex; }, [currentAyahIndex]);

  // ── expo-audio player (single instance, replace source for each ayah) ─────
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  // Derive playing state directly from player status
  const isPlaying = status.playing;

  // Configure audio session once on mount
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'doNotMix',
    }).catch(() => {}); // safe – Expo Go may limit some options
  }, []);

  // ── Auto-advance logic ────────────────────────────────────────────────────
  useEffect(() => {
    if (status.didJustFinish && autoAdvanceRef.current) {
      const currentIdx = currentAyahIndexRef.current;
      if (currentIdx !== null) {
        const nextIdx = currentIdx + 1;
        if (nextIdx < ayahsRef.current.length) {
          playAyah(nextIdx);
        } else {
          // End of surah
          setCurrentAyahIndex(null);
          currentAyahIndexRef.current = null;
        }
      }
    }
  }, [status.didJustFinish]);

  // ── FlatList ref for scroll-to-verse ──────────────────────────────────────
  const flatListRef = useRef<FlatList<UnifiedAyah> | null>(null);

  // ── Fetch surah data ──────────────────────────────────────────────────────
  const fetchSurahData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await quranApi.get<{ code: number; data: any[] }>(
        `/surah/${surahId}/editions/quran-simple-clean,en.asad,ar.alafasy`
      );
      const json = response.data;
      if (json.code !== 200 || !json.data || json.data.length < 3) {
        throw new Error('Invalid response from Quran API.');
      }

      const info: SurahInfo = {
        number: json.data[0].number,
        name: json.data[0].name,
        englishName: json.data[0].englishName,
        englishNameTranslation: json.data[0].englishNameTranslation,
        revelationType: json.data[0].revelationType,
        numberOfAyahs: json.data[0].numberOfAyahs,
      };

      const arabicAyahs = json.data[0].ayahs;
      const translationAyahs = json.data[1].ayahs;
      const audioAyahs = json.data[2].ayahs;

      const unified: UnifiedAyah[] = arabicAyahs.map((ayah: any, idx: number) => ({
        number: ayah.number,
        numberInSurah: ayah.numberInSurah,
        text: ayah.text,
        translation: translationAyahs[idx]?.text || '',
        audio: audioAyahs[idx]?.audio || '',
      }));

      setSurahInfo(info);
      setAyahs(unified);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while loading Surah content.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSurahData();
  }, [surahId]);

  // ── Audio controls ────────────────────────────────────────────────────────
  const playAyah = async (index: number) => {
    const ayahList = ayahsRef.current;
    if (index < 0 || index >= ayahList.length) return;

    const audioUrl = ayahList[index].audio;
    if (!audioUrl) return;

    setIsLoadingAudio(true);
    setCurrentAyahIndex(index);
    currentAyahIndexRef.current = index;

    try {
      // Save last read position
      if (surahInfo) {
        await AsyncStorage.setItem('quran_last_read', JSON.stringify({
          number: surahInfo.number,
          name: surahInfo.englishName,
          ayah: ayahList[index].numberInSurah,
        }));
      }

      // Replace source – expo-audio loads and makes the player ready
      player.replace({ uri: audioUrl });
      // Small delay to let the player register the new source, then play
      setTimeout(() => {
        try { player.play(); } catch (_) {}
        setIsLoadingAudio(false);
      }, 300);

      scrollToAyah(index);
    } catch (err) {
      console.error('Audio playback failed:', err);
      setIsLoadingAudio(false);
    }
  };

  const togglePlayPause = () => {
    if (currentAyahIndex === null) {
      // Start from first ayah
      playAyah(0);
      return;
    }
    try {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    } catch (err) {
      console.error('Play/Pause toggle failed:', err);
    }
  };

  const handleNext = () => {
    const idx = currentAyahIndexRef.current;
    if (idx === null) return;
    const nextIdx = idx + 1;
    if (nextIdx < ayahsRef.current.length) playAyah(nextIdx);
  };

  const handlePrev = () => {
    const idx = currentAyahIndexRef.current;
    if (idx === null) return;
    const prevIdx = idx - 1;
    if (prevIdx >= 0) playAyah(prevIdx);
  };

  const stopAudio = () => {
    try { player.pause(); } catch (_) {}
    setCurrentAyahIndex(null);
    currentAyahIndexRef.current = null;
  };

  const scrollToAyah = (index: number) => {
    try {
      flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.3 });
    } catch (_) {}
  };

  const onScrollToIndexFailed = (error: any) => {
    flatListRef.current?.scrollToOffset({
      offset: error.averageItemLength * error.index,
      animated: true,
    });
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: error.index,
        animated: true,
        viewPosition: 0.3,
      });
    }, 100);
  };

  // ── Ayah card renderer ─────────────────────────────────────────────────────
  const renderAyahItem = ({ item, index }: { item: UnifiedAyah; index: number }) => {
    const isActive = index === currentAyahIndex;
    return (
      <Card
        variant={isActive ? 'default' : 'outlined'}
        style={[
          styles.ayahCard,
          {
            borderColor: isActive ? theme.primary : theme.border,
            borderWidth: isActive ? 2 : 1,
            backgroundColor: isActive ? theme.primaryLight : theme.cardBackground,
          },
        ]}
      >
        <View style={styles.ayahHeader}>
          {/* Verse number circle */}
          <View style={[styles.numberContainer, { backgroundColor: isActive ? theme.primary : theme.backgroundElement }]}>
            <ThemedText style={[styles.ayahNumber, { color: isActive ? theme.textOnPrimary : theme.text }]}>
              {item.numberInSurah}
            </ThemedText>
          </View>

          {/* Per-ayah play button */}
          <Pressable
            style={[styles.playButtonCircle, { backgroundColor: isActive && isPlaying ? theme.accent : theme.primary }]}
            onPress={() => playAyah(index)}
          >
            {isActive && isLoadingAudio ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name={isActive && isPlaying ? 'pause' : 'play'} size={14} color="#FFFFFF" />
            )}
          </Pressable>
        </View>

        {/* Arabic text */}
        <ThemedText style={styles.arabicText}>{item.text}</ThemedText>

        {/* Translation */}
        <ThemedText style={styles.translationText} themeColor="textSecondary">
          {item.translation}
        </ThemedText>
      </Card>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>

        {surahInfo ? (
          <View style={styles.headerTitleContainer}>
            <ThemedText style={styles.headerTitle}>{surahInfo.englishName}</ThemedText>
            <ThemedText style={styles.headerSubtitle} themeColor="textSecondary">
              {surahInfo.englishNameTranslation} • {surahInfo.numberOfAyahs} Ayahs
            </ThemedText>
          </View>
        ) : (
          <ThemedText style={styles.headerTitle}>Loading...</ThemedText>
        )}

        <View style={styles.backButtonPlaceholder} />
      </View>

      {/* Body */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText style={styles.loaderText} themeColor="textSecondary">
            Loading recitations...
          </ThemedText>
        </View>
      ) : errorMsg ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.accent} />
          <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>
          <Pressable style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={fetchSurahData}>
            <ThemedText style={styles.retryText} themeColor="textOnPrimary">Retry</ThemedText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.container}>
          <FlatList
            ref={flatListRef}
            data={ayahs}
            renderItem={renderAyahItem}
            keyExtractor={(item) => item.number.toString()}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: currentAyahIndex !== null ? 150 : 40 },
            ]}
            showsVerticalScrollIndicator={false}
            onScrollToIndexFailed={onScrollToIndexFailed}
            ListHeaderComponent={
              surahId !== 9 && surahId !== 1 ? (
                <Card variant="outlined" style={styles.bismillahCard}>
                  <ThemedText style={styles.bismillahText}>
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </ThemedText>
                </Card>
              ) : null
            }
          />

          {/* ── Floating Audio Player Panel ───────────────────────────────── */}
          {currentAyahIndex !== null && (
            <Card
              style={[
                styles.playerPanel,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                  shadowColor: '#000',
                },
              ]}
            >
              {/* Now-playing info */}
              <View style={styles.playerInfoRow}>
                <View style={styles.playerTextContainer}>
                  <ThemedText style={styles.playerSurahName}>
                    {surahInfo?.englishName} • Ayah {currentAyahIndex + 1}
                  </ThemedText>
                  <ThemedText style={styles.playerReciter} themeColor="textSecondary">
                    Qari Mishary Rashid Alafasy
                  </ThemedText>
                </View>
                {isLoadingAudio ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <Badge
                    text={isPlaying ? 'Playing' : 'Paused'}
                    variant={isPlaying ? 'success' : 'light'}
                  />
                )}
              </View>

              {/* Controls */}
              <View style={styles.playerControlsRow}>
                {/* Auto-advance toggle */}
                <Pressable
                  style={[styles.utilityBtn, { backgroundColor: autoAdvance ? theme.primaryLight : 'transparent' }]}
                  onPress={() => setAutoAdvance(!autoAdvance)}
                >
                  <Ionicons
                    name="repeat"
                    size={20}
                    color={autoAdvance ? theme.primary : theme.textSecondary}
                  />
                </Pressable>

                {/* Previous */}
                <Pressable
                  style={[styles.navBtn, { borderColor: theme.border }]}
                  onPress={handlePrev}
                  disabled={currentAyahIndex === 0}
                >
                  <Ionicons
                    name="play-skip-back"
                    size={18}
                    color={currentAyahIndex === 0 ? theme.border : theme.text}
                  />
                </Pressable>

                {/* Play/Pause main */}
                <Pressable style={[styles.mainPlayBtn, { backgroundColor: theme.primary }]} onPress={togglePlayPause}>
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={24}
                    color="#FFFFFF"
                    style={{ marginLeft: isPlaying ? 0 : 3 }}
                  />
                </Pressable>

                {/* Next */}
                <Pressable
                  style={[styles.navBtn, { borderColor: theme.border }]}
                  onPress={handleNext}
                  disabled={currentAyahIndex === ayahs.length - 1}
                >
                  <Ionicons
                    name="play-skip-forward"
                    size={18}
                    color={currentAyahIndex === ayahs.length - 1 ? theme.border : theme.text}
                  />
                </Pressable>

                {/* Close */}
                <Pressable style={styles.utilityBtn} onPress={stopAudio}>
                  <Ionicons name="close" size={22} color={theme.textSecondary} />
                </Pressable>
              </View>
            </Card>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderBottomWidth: 1,
  },
  backButton: { padding: Spacing.two },
  backButtonPlaceholder: { width: 40 },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 11, marginTop: 2 },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
  },
  loaderText: { fontSize: 14, fontWeight: '500' },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.five,
    gap: Spacing.three,
  },
  errorText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  retryButton: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.two,
    borderRadius: 8,
  },
  retryText: { fontSize: 13, fontWeight: 'bold' },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  bismillahCard: {
    marginVertical: Spacing.two,
    paddingVertical: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bismillahText: {
    fontFamily: Platform.OS === 'ios' ? 'ui-serif' : 'serif',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#094C3A',
    textAlign: 'center',
  },
  ayahCard: {
    marginVertical: Spacing.two,
    padding: Spacing.four,
    borderRadius: 16,
  },
  ayahHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  numberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ayahNumber: { fontSize: 12, fontWeight: 'bold' },
  playButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arabicText: {
    fontSize: 24,
    lineHeight: 44,
    fontWeight: '500',
    textAlign: 'right',
    marginBottom: Spacing.three,
    fontFamily: Platform.OS === 'ios' ? 'ui-serif' : 'serif',
  },
  translationText: { fontSize: 14, lineHeight: 22 },
  // ── Player panel ──────────────────────────────────────────────────────────
  playerPanel: {
    position: 'absolute',
    bottom: Spacing.four,
    width: '92%',
    maxWidth: 500,
    alignSelf: 'center',
    padding: Spacing.three,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    zIndex: 100,
  },
  playerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  playerTextContainer: { flex: 1, marginRight: Spacing.two },
  playerSurahName: { fontSize: 14, fontWeight: 'bold' },
  playerReciter: { fontSize: 11, marginTop: 2 },
  playerControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
  },
  utilityBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainPlayBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
