import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList } from 'react-native';
import { SurahInfo, UnifiedAyah } from '@/types/type';
import { quranApi } from '@/utils/api';

export const useSurah = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const surahId = parseInt(Array.isArray(id) ? id[0] : id, 10);

  const [surahInfo, setSurahInfo] = useState<SurahInfo | null>(null);
  const [ayahs, setAyahs] = useState<UnifiedAyah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [currentAyahIndex, setCurrentAyahIndex] = useState<number | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);

  const currentAyahIndexRef = useRef<number | null>(null);
  const ayahsRef = useRef<UnifiedAyah[]>([]);
  const autoAdvanceRef = useRef(true);

  useEffect(() => { ayahsRef.current = ayahs; }, [ayahs]);
  useEffect(() => { autoAdvanceRef.current = autoAdvance; }, [autoAdvance]);
  useEffect(() => { currentAyahIndexRef.current = currentAyahIndex; }, [currentAyahIndex]);

  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const isPlaying = status.playing;

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'doNotMix',
    }).catch(() => { });
  }, []);

  useEffect(() => {
    if (status.didJustFinish && autoAdvanceRef.current) {
      const currentIdx = currentAyahIndexRef.current;
      if (currentIdx !== null) {
        const nextIdx = currentIdx + 1;
        if (nextIdx < ayahsRef.current.length) {
          playAyah(nextIdx);
        } else {
          setCurrentAyahIndex(null);
          currentAyahIndexRef.current = null;
        }
      }
    }
  }, [status.didJustFinish]);

  const flatListRef = useRef<FlatList<UnifiedAyah> | null>(null);

  const fetchSurahData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await quranApi.get<{ code: number; data: any[] }>(
        `/surah/${surahId}/editions/quran-simple,en.asad,ar.alafasy`
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

  const playAyah = async (index: number) => {
    const ayahList = ayahsRef.current;
    if (index < 0 || index >= ayahList.length) return;

    const audioUrl = ayahList[index].audio;
    if (!audioUrl) return;

    setIsLoadingAudio(true);
    setCurrentAyahIndex(index);
    currentAyahIndexRef.current = index;

    try {
      if (surahInfo) {
        await AsyncStorage.setItem('quran_last_read', JSON.stringify({
          number: surahInfo.number,
          name: surahInfo.englishName,
          ayah: ayahList[index].numberInSurah,
        }));
      }

      player.replace({ uri: audioUrl });
      setTimeout(() => {
        try { player.play(); } catch (_) { }
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
    try { player.pause(); } catch (_) { }
    setCurrentAyahIndex(null);
    currentAyahIndexRef.current = null;
  };

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
