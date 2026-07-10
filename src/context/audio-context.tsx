import { UnifiedAyah } from '@/types/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './auth-context';
import { useConnection } from './connection-context';

export interface PlayingContext {
  type: 'surah' | 'juz' | null;
  id: number | null;
  title: string;
}

interface AudioContextType {
  isPlaying: boolean;
  isLoadingAudio: boolean;
  currentAyahIndex: number | null;
  ayahs: UnifiedAyah[];
  playingContext: PlayingContext;
  autoAdvance: boolean;
  setAutoAdvance: (val: boolean) => void;
  playAyah: (index: number, ayahsList: UnifiedAyah[], context: PlayingContext) => Promise<void>;
  togglePlayPause: () => void;
  stopAudio: () => void;
  handleNext: () => void;
  handlePrev: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const { isOnline } = useConnection();
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const isPlaying = status.playing;

  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number | null>(null);
  const [ayahs, setAyahs] = useState<UnifiedAyah[]>([]);
  const [playingContext, setPlayingContext] = useState<PlayingContext>({
    type: null,
    id: null,
    title: '',
  });
  const [autoAdvance, setAutoAdvance] = useState(true);

  const currentAyahIndexRef = useRef<number | null>(null);
  const ayahsRef = useRef<UnifiedAyah[]>([]);
  const autoAdvanceRef = useRef(true);
  const playingContextRef = useRef<PlayingContext>({ type: null, id: null, title: '' });

  useEffect(() => { currentAyahIndexRef.current = currentAyahIndex; }, [currentAyahIndex]);
  useEffect(() => { ayahsRef.current = ayahs; }, [ayahs]);
  useEffect(() => { autoAdvanceRef.current = autoAdvance; }, [autoAdvance]);
  useEffect(() => { playingContextRef.current = playingContext; }, [playingContext]);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    }).catch(() => { });
  }, []);

  useEffect(() => {
    if (!isOnline && currentAyahIndexRef.current !== null) {
      stopAudio();
    }
  }, [isOnline]);

  useEffect(() => {
    if (status.didJustFinish && autoAdvanceRef.current) {
      const currentIdx = currentAyahIndexRef.current;
      if (currentIdx !== null) {
        const nextIdx = currentIdx + 1;
        if (nextIdx < ayahsRef.current.length) {
          playAyahInternal(nextIdx);
        } else {
          setCurrentAyahIndex(null);
          currentAyahIndexRef.current = null;
        }
      }
    }
  }, [status.didJustFinish]);

  const playAyahInternal = async (index: number) => {
    const list = ayahsRef.current;
    const context = playingContextRef.current;
    if (index < 0 || index >= list.length) return;

    if (!isOnline) {
      return;
    }

    const audioUrl = list[index].audio;
    if (!audioUrl) return;

    setIsLoadingAudio(true);
    setCurrentAyahIndex(index);
    currentAyahIndexRef.current = index;

    try {
      const totalAyahsCount = list.length;
      const dataToStore = {
        number: context.type === 'surah' ? context.id : list[index].surah?.number,
        name: context.type === 'surah' ? context.title : list[index].surah?.englishName,
        ayah: list[index].numberInSurah,
        totalAyahs: totalAyahsCount,
      };

      if (user && token !== 'guest') {
        const storageKey = `quran_last_read_${user._id}`;
        await AsyncStorage.setItem(storageKey, JSON.stringify(dataToStore));
      }
      await AsyncStorage.setItem('quran_last_read', JSON.stringify(dataToStore));

      player.replace({ uri: audioUrl });
      setTimeout(() => {
        try { player.play(); } catch (_) { }
        setIsLoadingAudio(false);
      }, 300);
    } catch (err) {
      console.error('Audio playback failed in provider:', err);
      setIsLoadingAudio(false);
    }
  };

  const playAyah = async (index: number, ayahsList: UnifiedAyah[], context: PlayingContext) => {
    setAyahs(ayahsList);
    ayahsRef.current = ayahsList;
    setPlayingContext(context);
    playingContextRef.current = context;
    await playAyahInternal(index);
  };

  const togglePlayPause = () => {
    if (currentAyahIndex === null) {
      if (ayahs.length > 0) {
        playAyahInternal(0);
      }
      return;
    }
    try {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    } catch (err) {
      console.error('Play/Pause toggle failed in provider:', err);
    }
  };

  const stopAudio = () => {
    try {
      player.pause();
    } catch (_) { }
    setCurrentAyahIndex(null);
    currentAyahIndexRef.current = null;
  };

  const handleNext = () => {
    const idx = currentAyahIndexRef.current;
    if (idx === null) return;
    const nextIdx = idx + 1;
    if (nextIdx < ayahsRef.current.length) {
      playAyahInternal(nextIdx);
    }
  };

  const handlePrev = () => {
    const idx = currentAyahIndexRef.current;
    if (idx === null) return;
    const prevIdx = idx - 1;
    if (prevIdx >= 0) {
      playAyahInternal(prevIdx);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        isLoadingAudio,
        currentAyahIndex,
        ayahs,
        playingContext,
        autoAdvance,
        setAutoAdvance,
        playAyah,
        togglePlayPause,
        stopAudio,
        handleNext,
        handlePrev,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
