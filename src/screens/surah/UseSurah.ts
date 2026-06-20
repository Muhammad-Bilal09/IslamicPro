import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList } from 'react-native';
import { SurahInfo, UnifiedAyah } from '@/types/type';
import { quranApi } from '@/utils/api';
import { useAudio } from '@/context/audio-context';
import { useTranslation } from '@/context/translation-context';

export const useSurah = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const surahId = parseInt(Array.isArray(id) ? id[0] : id, 10);
  const { translationLang } = useTranslation();

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
      const translationEdition = translationLang === 'ur' ? 'ur.jalandhry' : 'en.asad';
      const response = await quranApi.get<{ code: number; data: any[] }>(
        `/surah/${surahId}/editions/quran-simple,${translationEdition},ar.alafasy`
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
  }, [surahId, translationLang]);

  const playAyah = async (index: number) => {
    if (!surahInfo) return;
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
  };
};
