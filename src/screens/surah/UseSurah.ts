import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList } from 'react-native';
import { SurahInfo, UnifiedAyah, Bookmark } from '@/types/type';
import { useAudio } from '@/context/audio-context';
import { useTranslation } from '@/context/translation-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/auth-context';
import { getSurahAyahs } from '@/utils/quranDb';

export const useSurah = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const surahId = parseInt(Array.isArray(id) ? id[0] : id, 10);
  const { translationLang } = useTranslation();
  const { user, token } = useAuth();

  const [surahInfo, setSurahInfo] = useState<SurahInfo | null>(null);
  const [ayahs, setAyahs] = useState<UnifiedAyah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    isPlaying,
    isLoadingAudio,
    currentAyahIndex: globalAyahIndex,
    playingContext,
    autoAdvance,
    setAutoAdvance,
    playAyah: playGlobalAyah,
    togglePlayPause,
    stopAudio,
    handleNext,
    handlePrev,
  } = useAudio();

  const isCurrentSurahPlaying = playingContext.type === 'surah' && playingContext.id === surahId;
  const currentAyahIndex = isCurrentSurahPlaying ? globalAyahIndex : null;

  const flatListRef = useRef<FlatList<UnifiedAyah> | null>(null);

  const fetchSurahData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const unified = await getSurahAyahs(surahId, translationLang);
      if (unified.length === 0) {
        throw new Error('No verses found locally. Please ensure the Quran is downloaded.');
      }

      const firstVerse = unified[0];
      const info: SurahInfo = {
        number: firstVerse.surah.number,
        name: firstVerse.surah.name,
        englishName: firstVerse.surah.englishName,
        englishNameTranslation: firstVerse.surah.englishNameTranslation,
        revelationType: firstVerse.surah.revelationType,
        numberOfAyahs: firstVerse.surah.numberOfAyahs,
      };

      setSurahInfo(info);
      setAyahs(unified);

      // Save last read position when opening the Surah
      const dataToStore = {
        number: info.number,
        name: info.englishName,
        ayah: 1,
        totalAyahs: info.numberOfAyahs,
      };

      try {
        if (user && token !== 'guest') {
          const storageKey = `quran_last_read_${user._id}`;
          const existing = await AsyncStorage.getItem(storageKey);
          if (existing) {
            const parsed = JSON.parse(existing);
            if (parsed.number === info.number) {
              dataToStore.ayah = parsed.ayah || 1;
            }
          }
          await AsyncStorage.setItem(storageKey, JSON.stringify(dataToStore));
        } else {
          const existing = await AsyncStorage.getItem('quran_last_read');
          if (existing) {
            const parsed = JSON.parse(existing);
            if (parsed.number === info.number) {
              dataToStore.ayah = parsed.ayah || 1;
            }
          }
        }
        await AsyncStorage.setItem('quran_last_read', JSON.stringify(dataToStore));
      } catch (e) {
        console.error('Failed to save last read in UseSurah:', e);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while loading Surah content.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSurahData();
  }, [surahId, translationLang]);

  const playAyah = async (index: number) => {
    if (!surahInfo) return;
    if (index === currentAyahIndex) {
      togglePlayPause();
      return;
    }
    await playGlobalAyah(index, ayahs, {
      type: 'surah',
      id: surahInfo.number,
      title: surahInfo.englishName,
    });
  };

  useEffect(() => {
    if (isCurrentSurahPlaying && currentAyahIndex !== null) {
      scrollToAyah(currentAyahIndex);
    }
  }, [currentAyahIndex, isCurrentSurahPlaying]);

  const scrollToAyah = (index: number) => {
    try {
      flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.3 });
    } catch (_) { }
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

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const loadBookmarks = async () => {
    if (user && token !== 'guest') {
      const storageKey = `quran_bookmarks_${user._id}`;
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) {
        setBookmarks(JSON.parse(stored));
      } else {
        setBookmarks([]);
      }
    } else {
      setBookmarks([]);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, [user?._id, token]);

  const isBookmarked = (ayah: UnifiedAyah) => {
    return bookmarks.some(
      (b) => b.surahNumber === surahId && b.numberInSurah === ayah.numberInSurah
    );
  };

  const toggleBookmark = async (ayah: UnifiedAyah) => {
    if (!surahInfo || !user || token === 'guest') return;
    const storageKey = `quran_bookmarks_${user._id}`;
    let updated: Bookmark[] = [...bookmarks];
    const isBooked = isBookmarked(ayah);
    if (isBooked) {
      updated = updated.filter(
        (b) => !(b.surahNumber === surahId && b.numberInSurah === ayah.numberInSurah)
      );
    } else {
      updated.push({
        surahNumber: surahId,
        surahName: surahInfo.englishName,
        numberInSurah: ayah.numberInSurah,
        text: ayah.text,
        translation: ayah.translation,
      });
    }
    setBookmarks(updated);
    await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
  };

  return {
    router,
    surahId,
    surahInfo,
    ayahs,
    isLoading,
    errorMsg,
    currentAyahIndex,
    isLoadingAudio,
    autoAdvance,
    setAutoAdvance,
    isPlaying,
    flatListRef,
    fetchSurahData,
    playAyah,
    togglePlayPause,
    handleNext,
    handlePrev,
    stopAudio,
    onScrollToIndexFailed,
    user,
    token,
    bookmarks,
    isBookmarked,
    toggleBookmark,
  };
};
