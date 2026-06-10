import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

import { useTheme } from '@/hooks/use-theme';
import { quranApi } from '@/utils/api';
import { Spacing } from '@/constants/theme';
import Badge from '@/components/badge';
import Card from '@/components/card';
import { ThemedText } from '@/components/themed-text';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SurahInfo {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
}

interface UnifiedAyah {
  number: number;
  numberInSurah: number;
  text: string;
  translation: string;
  audio: string;
  surah: SurahInfo;
}

export function JuzScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const juzId = parseInt(Array.isArray(id) ? id[0] : id, 10);

  // ── Screen data state ─────────────────────────────────────────────────────
  const [ayahs, setAyahs] = useState<UnifiedAyah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [juzTitle, setJuzTitle] = useState<string>(`Para ${juzId}`);

  // ── Audio playback state ──────────────────────────────────────────────────
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);

  // Stale-closure-safe refs
  const currentAyahIndexRef = useRef<number | null>(null);
  const ayahsRef = useRef<UnifiedAyah[]>([]);
  const autoAdvanceRef = useRef(true);

  useEffect(() => {
    ayahsRef.current = ayahs;
  }, [ayahs]);

  useEffect(() => {
    autoAdvanceRef.current = autoAdvance;
  }, [autoAdvance]);

  useEffect(() => {
    currentAyahIndexRef.current = currentAyahIndex;
  }, [currentAyahIndex]);

  // ── expo-audio player ─────────────────────────────────────────────────────
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const isPlaying = status.playing;

  // Configure audio session
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'doNotMix',
    }).catch(() => {});
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
          // End of Para
          setCurrentAyahIndex(null);
          currentAyahIndexRef.current = null;
        }
      }
    }
  }, [status.didJustFinish]);

  // ── FlatList ref for scroll-to-verse ──────────────────────────────────────
  const flatListRef = useRef<FlatList<UnifiedAyah> | null>(null);

  // ── Fetch Juz data ────────────────────────────────────────────────────────
  const fetchJuzData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // Fetch 3 editions in parallel
      const [resArabic, resTrans, resAudio] = await Promise.all([
        quranApi.get<{ code: number; data: any }>(`/juz/${juzId}/quran-simple-clean`),
        quranApi.get<{ code: number; data: any }>(`/juz/${juzId}/en.asad`),
        quranApi.get<{ code: number; data: any }>(`/juz/${juzId}/ar.alafasy`),
      ]);

      if (
        resArabic.data.code !== 200 ||
        resTrans.data.code !== 200 ||
        resAudio.data.code !== 200
      ) {
        throw new Error('API returned an error loading Juz content.');
      }

      const arabicAyahs = resArabic.data.data.ayahs;
      const translationAyahs = resTrans.data.data.ayahs;
      const audioAyahs = resAudio.data.data.ayahs;

      if (!arabicAyahs || arabicAyahs.length === 0) {
        throw new Error('No verses found for this Juz.');
      }

      // Map to unified array of ayahs
      const unified: UnifiedAyah[] = arabicAyahs.map((ayah: any, idx: number) => ({
        number: ayah.number,
        numberInSurah: ayah.numberInSurah,
        text: ayah.text,
        translation: translationAyahs[idx]?.text || '',
        audio: audioAyahs[idx]?.audio || '',
        surah: {
          number: ayah.surah.number,
          name: ayah.surah.name,
          englishName: ayah.surah.englishName,
          englishNameTranslation: ayah.surah.englishNameTranslation,
          revelationType: ayah.surah.revelationType.toUpperCase(),
          numberOfAyahs: ayah.surah.numberOfAyahs,
        },
      }));

      // Calculate starting and ending surahs for title description
      const startSurah = unified[0].surah.englishName;
      const endSurah = unified[unified.length - 1].surah.englishName;
      if (startSurah === endSurah) {
        setJuzTitle(`Para ${juzId} • ${startSurah}`);
      } else {
        setJuzTitle(`Para ${juzId} • ${startSurah} - ${endSurah}`);
      }

      setAyahs(unified);

      // Save initial last read position
      await AsyncStorage.setItem('quran_last_read', JSON.stringify({
        number: unified[0].surah.number,
        name: unified[0].surah.englishName,
        ayah: unified[0].numberInSurah,
      }));
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while loading Para content.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (juzId >= 1 && juzId <= 30) {
      fetchJuzData();
    } else {
      setErrorMsg('Invalid Para number. Please select a number between 1 and 30.');
      setIsLoading(false);
    }
  }, [juzId]);

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
      const currentAyah = ayahList[index];
      await AsyncStorage.setItem('quran_last_read', JSON.stringify({
        number: currentAyah.surah.number,
        name: currentAyah.surah.englishName,
        ayah: currentAyah.numberInSurah,
      }));

      // Replace source and play
      player.replace({ uri: audioUrl });
      setTimeout(() => {
        try {
          player.play();
        } catch (_) {}
        setIsLoadingAudio(false);
      }, 300);

      scrollToAyah(index);
    } catch (err) {
      console.error('Juz audio playback failed:', err);
      setIsLoadingAudio(false);
    }
  };

  const togglePlayPause = () => {
    if (currentAyahIndex === null) {
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
    try {
      player.pause();
    } catch (_) {}
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

  // ── Ayah & Surah Separator renderer ────────────────────────────────────────
  const renderAyahItem = ({ item, index }: { item: UnifiedAyah; index: number }) => {
    const isActive = index === currentAyahIndex;
    const isNewSurah = index === 0 || item.surah.number !== ayahs[index - 1].surah.number;

    return (
      <View>
        {/* Dynamic Surah Boundary Header */}
        {isNewSurah && (
          <View style={styles.surahHeaderContainer}>
            <Card
              variant="outlined"
              style={[
                styles.surahHeaderCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.surahHeaderRow}>
                {/* Surah Number Badge */}
                <View style={[styles.surahNumberBadge, { backgroundColor: theme.primary }]}>
                  <ThemedText style={styles.surahNumberText}>{item.surah.number}</ThemedText>
                </View>

                {/* Surah details */}
                <View style={styles.surahHeaderTitles}>
                  <ThemedText style={styles.surahHeaderName}>{item.surah.englishName}</ThemedText>
                  <ThemedText style={styles.surahHeaderTranslation} themeColor="textSecondary">
                    {item.surah.englishNameTranslation} • {item.surah.numberOfAyahs} Ayahs
                  </ThemedText>
                </View>

                {/* Arabic name and revelation type */}
                <View style={styles.surahHeaderRight}>
                  <ThemedText style={styles.surahHeaderArabic}>{item.surah.name}</ThemedText>
                  <Badge text={item.surah.revelationType} variant="light" />
                </View>
              </View>
            </Card>

            {/* Bismillah Card (if it is a new Surah, and not Surah 9 (At-Tawbah), and not Surah 1 (where Bismillah is built-in as verse 1)) */}
            {item.surah.number !== 9 && (item.surah.number !== 1 || item.numberInSurah !== 1) && item.numberInSurah === 1 && (
              <Card variant="outlined" style={styles.bismillahCard}>
                <ThemedText style={styles.bismillahText}>
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </ThemedText>
              </Card>
            )}
          </View>
        )}

        {/* Regular Ayah Card */}
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
            <View
              style={[
                styles.numberContainer,
                { backgroundColor: isActive ? theme.primary : theme.backgroundElement },
              ]}
            >
              <ThemedText style={[styles.ayahNumber, { color: isActive ? theme.textOnPrimary : theme.text }]}>
                {item.numberInSurah}
              </ThemedText>
            </View>

            <View style={styles.ayahHeaderRightActions}>
              <ThemedText style={styles.surahNameTag} themeColor="textSecondary">
                {item.surah.englishName}
              </ThemedText>
              <Pressable
                style={[
                  styles.playButtonCircle,
                  { backgroundColor: isActive && isPlaying ? theme.accent : theme.primary },
                ]}
                onPress={() => playAyah(index)}
              >
                {isActive && isLoadingAudio ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name={isActive && isPlaying ? 'pause' : 'play'} size={14} color="#FFFFFF" />
                )}
              </Pressable>
            </View>
          </View>

          <ThemedText style={styles.arabicText}>{item.text}</ThemedText>
          <ThemedText style={styles.translationText} themeColor="textSecondary">
            {item.translation}
          </ThemedText>
        </Card>
      </View>
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

        <View style={styles.headerTitleContainer}>
          <ThemedText style={styles.headerTitle}>Juz {juzId}</ThemedText>
          <ThemedText style={styles.headerSubtitle} themeColor="textSecondary" numberOfLines={1}>
            {isLoading ? 'Loading Para content...' : juzTitle}
          </ThemedText>
        </View>

        <View style={styles.backButtonPlaceholder} />
      </View>

      {/* Body */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText style={styles.loaderText} themeColor="textSecondary">
            Retrieving Para {juzId} verses...
          </ThemedText>
        </View>
      ) : errorMsg ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.accent} />
          <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>
          <Pressable style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={fetchJuzData}>
            <ThemedText style={styles.retryText} themeColor="textOnPrimary">Retry</ThemedText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.container}>
          <FlatList
            ref={flatListRef}
            data={ayahs}
            renderItem={renderAyahItem}
            keyExtractor={(item) => `juz-${juzId}-ayah-${item.number}`}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: currentAyahIndex !== null ? 150 : 40 },
            ]}
            showsVerticalScrollIndicator={false}
            onScrollToIndexFailed={onScrollToIndexFailed}
          />

          {/* Floating Audio Player Panel */}
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
              <View style={styles.playerInfoRow}>
                <View style={styles.playerTextContainer}>
                  <ThemedText style={styles.playerSurahName} numberOfLines={1}>
                    {ayahs[currentAyahIndex]?.surah.englishName} • Ayah {ayahs[currentAyahIndex]?.numberInSurah}
                  </ThemedText>
                  <ThemedText style={styles.playerReciter} themeColor="textSecondary">
                    Para {juzId} • Mishary Rashid Alafasy
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
  headerTitleContainer: { alignItems: 'center', flex: 1, paddingHorizontal: Spacing.two },
  headerTitle: { fontSize: 16, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 11, marginTop: 2, textAlign: 'center' },
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
  // ── Surah Separator Headers ──
  surahHeaderContainer: {
    marginVertical: Spacing.three,
  },
  surahHeaderCard: {
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
  },
  surahHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  surahNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  surahNumberText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  surahHeaderTitles: {
    flex: 1,
    gap: 2,
  },
  surahHeaderName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  surahHeaderTranslation: {
    fontSize: 11,
  },
  surahHeaderRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  surahHeaderArabic: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bismillahCard: {
    marginTop: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bismillahText: {
    fontFamily: Platform.OS === 'ios' ? 'ui-serif' : 'serif',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#094C3A',
    textAlign: 'center',
  },
  // ── Ayah Card ──
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
  ayahHeaderRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  surahNameTag: {
    fontSize: 11,
    fontWeight: '600',
  },
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
  // ── Player Panel ──
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
