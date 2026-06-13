import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList } from 'react-native';
import { UnifiedAyah } from '@/types/type';
import { quranApi } from '@/utils/api';

export const useParah = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const juzId = parseInt(Array.isArray(id) ? id[0] : id, 10);

  const [ayahs, setAyahs] = useState<UnifiedAyah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [juzTitle, setJuzTitle] = useState<string>(`Para ${juzId}`);

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

  const fetchJuzData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
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

      const startSurah = unified[0].surah.englishName;
      const endSurah = unified[unified.length - 1].surah.englishName;
      if (startSurah === endSurah) {
        setJuzTitle(`Para ${juzId} • ${startSurah}`);
      } else {
        setJuzTitle(`Para ${juzId} • ${startSurah} - ${endSurah}`);
      }

      setAyahs(unified);

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

  const playAyah = async (index: number) => {
    const ayahList = ayahsRef.current;
    if (index < 0 || index >= ayahList.length) return;

    const audioUrl = ayahList[index].audio;
    if (!audioUrl) return;

    setIsLoadingAudio(true);
    setCurrentAyahIndex(index);
    currentAyahIndexRef.current = index;

    try {
      const currentAyah = ayahList[index];
      await AsyncStorage.setItem('quran_last_read', JSON.stringify({
        number: currentAyah.surah.number,
        name: currentAyah.surah.englishName,
        ayah: currentAyah.numberInSurah,
      }));

      player.replace({ uri: audioUrl });
      setTimeout(() => {
        try { player.play(); } catch (_) { }
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
  };
};
