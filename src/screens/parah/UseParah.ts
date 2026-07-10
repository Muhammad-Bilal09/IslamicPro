import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList } from 'react-native';
import { UnifiedAyah, Bookmark } from '@/types/type';
import { useAudio } from '@/context/audio-context';
import { useTranslation } from '@/context/translation-context';
import { useAuth } from '@/context/auth-context';
import { getJuzAyahs } from '@/utils/quranDb';

export const useParah = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const juzId = parseInt(Array.isArray(id) ? id[0] : id, 10);
  const { translationLang } = useTranslation();
  const { user, token } = useAuth();

  const [ayahs, setAyahs] = useState<UnifiedAyah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [juzTitle, setJuzTitle] = useState<string>(`Para ${juzId}`);

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

  const isCurrentJuzPlaying = playingContext.type === 'juz' && playingContext.id === juzId;
  const currentAyahIndex = isCurrentJuzPlaying ? globalAyahIndex : null;

  const flatListRef = useRef<FlatList<UnifiedAyah> | null>(null);

  const fetchJuzData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const unified = await getJuzAyahs(juzId, translationLang);
      if (unified.length === 0) {
        throw new Error('No verses found locally. Please ensure the Quran is downloaded.');
      }

      const startSurah = unified[0].surah.englishName;
      const endSurah = unified[unified.length - 1].surah.englishName;
      if (startSurah === endSurah) {
        setJuzTitle(`Para ${juzId} • ${startSurah}`);
      } else {
        setJuzTitle(`Para ${juzId} • ${startSurah} - ${endSurah}`);
      }

      setAyahs(unified);

      const dataToStore = {
        number: unified[0].surah.number,
        name: unified[0].surah.englishName,
        ayah: unified[0].numberInSurah,
        totalAyahs: unified[0].surah.numberOfAyahs,
      };

      try {
        if (user && token !== 'guest') {
          const storageKey = `quran_last_read_${user._id}`;
          await AsyncStorage.setItem(storageKey, JSON.stringify(dataToStore));
        }
        await AsyncStorage.setItem('quran_last_read', JSON.stringify(dataToStore));
      } catch (e) {
        console.error('Failed to save last read in UseParah:', e);
      }
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
  }, [juzId, translationLang]);

  const playAyah = async (index: number) => {
    if (index === currentAyahIndex) {
      togglePlayPause();
      return;
    }
    await playGlobalAyah(index, ayahs, {
      type: 'juz',
      id: juzId,
      title: juzTitle,
    });
  };

  useEffect(() => {
    if (isCurrentJuzPlaying && currentAyahIndex !== null) {
      scrollToAyah(currentAyahIndex);
    }
  }, [currentAyahIndex, isCurrentJuzPlaying]);

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
      (b) => b.surahNumber === ayah.surah?.number && b.numberInSurah === ayah.numberInSurah
    );
  };

  const toggleBookmark = async (ayah: UnifiedAyah) => {
    if (!user || token === 'guest') return;
    const storageKey = `quran_bookmarks_${user._id}`;
    let updated: Bookmark[] = [...bookmarks];
    const isBooked = isBookmarked(ayah);
    if (isBooked) {
      updated = updated.filter(
        (b) => !(b.surahNumber === ayah.surah?.number && b.numberInSurah === ayah.numberInSurah)
      );
    } else {
      updated.push({
        surahNumber: ayah.surah?.number || 1,
        surahName: ayah.surah?.englishName || '',
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
    juzId,
    ayahs,
    isLoading,
    errorMsg,
    juzTitle,
    currentAyahIndex,
    isLoadingAudio,
    autoAdvance,
    setAutoAdvance,
    isPlaying,
    flatListRef,
    fetchJuzData,
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
