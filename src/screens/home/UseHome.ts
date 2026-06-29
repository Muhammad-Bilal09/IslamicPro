import { useTranslation } from '@/context/translation-context';
import { PrayerTimings } from '@/types/type';
import { quranApi } from '@/utils/api';
import {
  fetchPrayerTimesByCity,
  fetchPrayerTimesByCoords,
  getAdjustedHijriDate,
  getCurrentAndNextPrayer,
} from '@/utils/prayerApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

export interface DailyAyah {
  text: string;
  translation: string;
  surahName: string;
  surahNumber: number;
  numberInSurah: number;
  date: string;
  lang?: string;
}

const FALLBACK_AYAH: DailyAyah = {
  text: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
  translation: 'For indeed, with hardship [will be] ease.',
  surahName: 'Ash-Sharh',
  surahNumber: 94,
  numberInSurah: 5,
  date: '',
};

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isCompleted: boolean;
}

export function getTimeUntilRamadan(): TimeRemaining {
  const now = new Date();
  const RAMADAN_START_DATES = [
    new Date(2027, 1, 8, 0, 0, 0),
    new Date(2028, 0, 28, 0, 0, 0),
    new Date(2029, 0, 16, 0, 0, 0),
    new Date(2030, 0, 5, 0, 0, 0),
  ];

  let nextRamadan = RAMADAN_START_DATES[0];
  for (const date of RAMADAN_START_DATES) {
    if (date.getTime() > now.getTime()) {
      nextRamadan = date;
      break;
    }
  }

  const diffTime = nextRamadan.getTime() - now.getTime();
  if (diffTime <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isCompleted: true };
  }

  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffTime / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffTime / 1000 / 60) % 60);
  const seconds = Math.floor((diffTime / 1000) % 60);

  return { days, hours, minutes, seconds, isCompleted: false };
}

export const useHome = () => {
  const { translationLang } = useTranslation();
  const [city, setCity] = useState('Karachi');
  const [country, setCountry] = useState('Pakistan');
  const [method, setMethod] = useState(1);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimings | null>(null);
  const [hijriDate, setHijriDate] = useState('Loading Date...');
  const [isLoading, setIsLoading] = useState(false);

  const [currentPrayerName, setCurrentPrayerName] = useState('...');
  const [nextPrayerName, setNextPrayerName] = useState('...');
  const [nextPrayerTime, setNextPrayerTime] = useState('...');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalWaitSeconds, setTotalWaitSeconds] = useState(1);
  const [progress, setProgress] = useState(0);

  const [dailyAyahData, setDailyAyahData] = useState<DailyAyah>(FALLBACK_AYAH);
  const [isAyahLoading, setIsAyahLoading] = useState(true);
  const [isDailyAyahEnabled, setIsDailyAyahEnabled] = useState(true);
  const [ramadanCountdown, setRamadanCountdown] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isCompleted: false,
  });

  useEffect(() => {
    const updateCountdown = () => {
      setRamadanCountdown(getTimeUntilRamadan());
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadSettingsAndTimings = async () => {
    setIsLoading(true);
    try {
      const storedCity = await AsyncStorage.getItem('prayer_city');
      const storedCountry = await AsyncStorage.getItem('prayer_country');
      const storedGPS = await AsyncStorage.getItem('prayer_use_gps');
      const storedMethod = await AsyncStorage.getItem('prayer_method');
      const storedSchool = await AsyncStorage.getItem('prayer_school');

      const currentMethod = storedMethod ? parseInt(storedMethod, 10) : 1;
      const currentSchool = storedSchool ? parseInt(storedSchool, 10) : 1;
      setMethod(currentMethod);

      let data;
      let activeCity = storedCity || 'Karachi';
      let activeCountry = storedCountry || 'Pakistan';

      if (storedGPS === 'true') {
        const storedLat = await AsyncStorage.getItem('prayer_lat');
        const storedLng = await AsyncStorage.getItem('prayer_lng');
        if (storedLat && storedLng) {
          data = await fetchPrayerTimesByCoords(parseFloat(storedLat), parseFloat(storedLng), currentMethod, currentSchool);
          activeCity = storedCity || 'Current Location';
          activeCountry = storedCountry || '';
          setCity(activeCity);
          setCountry(activeCountry);
        }
      }

      if (!data) {
        setCity(activeCity);
        setCountry(activeCountry);
        data = await fetchPrayerTimesByCity(activeCity, activeCountry, currentMethod, currentSchool);
      }

      setPrayerTimes(data.timings);
      setHijriDate(getAdjustedHijriDate(data.date.hijri, activeCountry, activeCity));
    } catch (err) {
      console.error('HomeScreen Error loading timings:', err);
      try {
        const fallbackData = await fetchPrayerTimesByCity('Karachi', 'Pakistan', 1, 1);
        setPrayerTimes(fallbackData.timings);
        setHijriDate(getAdjustedHijriDate(fallbackData.date.hijri, 'Pakistan', 'Karachi'));
        setCity('Karachi');
        setCountry('Pakistan');
      } catch (fErr) {
        console.error('HomeScreen Fallback failed:', fErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadDailyAyah = async () => {
    let enabled = true;
    try {
      const storedSetting = await AsyncStorage.getItem('daily_ayah_enabled');
      enabled = storedSetting !== 'false';
      setIsDailyAyahEnabled(enabled);
    } catch (_) { }

    if (!enabled) {
      setIsAyahLoading(false);
      return;
    }

    setIsAyahLoading(true);
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    try {
      const cached = await AsyncStorage.getItem('daily_ayah');
      if (cached) {
        const parsed: DailyAyah = JSON.parse(cached);
        if (parsed.date === todayStr && parsed.lang === translationLang) {
          setDailyAyahData(parsed);
          setIsAyahLoading(false);
          return;
        }
      }

      const randomIdx = Math.floor(Math.random() * 6236) + 1;
      const translationEdition = translationLang === 'ur' ? 'ur.jalandhry' : 'en.asad';
      const res = await quranApi.get(`/ayah/${randomIdx}/editions/quran-simple,${translationEdition}`);
      const data = res.data;

      if (data.code === 200 && Array.isArray(data.data) && data.data.length >= 2) {
        const arabic = data.data[0];
        const translation = data.data[1];
        const newAyah: DailyAyah = {
          text: arabic.text,
          translation: translation.text,
          surahName: arabic.surah.englishName,
          surahNumber: arabic.surah.number,
          numberInSurah: arabic.numberInSurah,
          date: todayStr,
          lang: translationLang,
        };
        await AsyncStorage.setItem('daily_ayah', JSON.stringify(newAyah));
        setDailyAyahData(newAyah);
      } else {
        throw new Error('Invalid response from Quran API.');
      }
    } catch (err) {
      console.error('HomeScreen Error loading daily ayah:', err);
      try {
        const cached = await AsyncStorage.getItem('daily_ayah');
        if (cached) {
          setDailyAyahData(JSON.parse(cached));
        } else {
          setDailyAyahData(FALLBACK_AYAH);
        }
      } catch (_) {
        setDailyAyahData(FALLBACK_AYAH);
      }
    } finally {
      setIsAyahLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSettingsAndTimings();
      loadDailyAyah();
    }, [translationLang])
  );

  useEffect(() => {
    if (!prayerTimes) return;

    const updateTimer = () => {
      const info = getCurrentAndNextPrayer(prayerTimes);
      setCurrentPrayerName(info.current);
      setNextPrayerName(info.next);
      setNextPrayerTime(info.nextTime);
      setSecondsLeft(info.secondsLeft);
      setTotalWaitSeconds(info.totalWaitSeconds);
      setProgress(info.progress);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  const formatCountdown = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    city,
    country,
    isLoading,
    currentPrayerName,
    nextPrayerName,
    nextPrayerTime,
    secondsLeft,
    progress,
    formatCountdown,
    dailyAyahData,
    isAyahLoading,
    isDailyAyahEnabled,
    ramadanCountdown,
    hijriDate,
  };
};
