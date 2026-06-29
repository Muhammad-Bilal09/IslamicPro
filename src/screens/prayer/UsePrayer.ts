import { useTranslation } from '@/context/translation-context';
import { DayItem, PrayerTimings } from '@/types/type';
import { quranApi } from '@/utils/api';
import { checkAndScheduleNotifications } from '@/utils/notifications';
import {
  fetchPrayerTimesByCity,
  fetchPrayerTimesByCoords,
  getAdjustedHijriDate,
  getCurrentAndNextPrayer,
} from '@/utils/prayerApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { DailyAyah } from '../home/UseHome';

const FALLBACK_AYAH: DailyAyah = {
  text: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
  translation: 'For indeed, with hardship [will be] ease.',
  surahName: 'Ash-Sharh',
  surahNumber: 94,
  numberInSurah: 5,
  date: '',
};

export function formatCountdown(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(safeSeconds / 3600);
  const m = Math.floor((safeSeconds % 3600) / 60);
  const s = safeSeconds % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, '0')).join(':');
}

export const usePrayer = () => {
  const { translationLang } = useTranslation();
  const [city, setCity] = useState('Karachi');
  const [country, setCountry] = useState('Pakistan');
  const [method, setMethod] = useState(1);
  const [school, setSchool] = useState(1);
  const [hijriDate, setHijriDate] = useState('Loading Date...');
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimings | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [inputCity, setInputCity] = useState('Karachi');
  const [inputCountry, setInputCountry] = useState('Pakistan');
  const [showConfig, setShowConfig] = useState(false);
  const [useGPS, setUseGPS] = useState(false);

  const [nextPrayerName, setNextPrayerName] = useState('...');
  const [nextPrayerTime, setNextPrayerTime] = useState('...');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentPrayerName, setCurrentPrayerName] = useState('...');

  const [dailyAyahData, setDailyAyahData] = useState<DailyAyah>(FALLBACK_AYAH);
  const [isAyahLoading, setIsAyahLoading] = useState(true);
  const [isDailyAyahEnabled, setIsDailyAyahEnabled] = useState(true);

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
      console.error('PrayerScreen Error loading daily ayah:', err);
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

  const [prayerToggles, setPrayerToggles] = useState<Record<string, boolean>>({
    Fajr: true,
    Sunrise: false,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true,
  });

  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const days: DayItem[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i - 3);
    return {
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      dayNum: d.getDate(),
    };
  });

  const fetchTimingsByCity = async (cityName: string, countryName: string, methodId: number, schoolId = school) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchPrayerTimesByCity(cityName, countryName, methodId, schoolId);
      setPrayerTimes(data.timings);
      setHijriDate(getAdjustedHijriDate(data.date.hijri, countryName, cityName));
      await checkAndScheduleNotifications(null, true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch prayer times.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTimingsByCoords = async (lat: number, lng: number, methodId: number, schoolId = school) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchPrayerTimesByCoords(lat, lng, methodId, schoolId);
      setPrayerTimes(data.timings);
      setHijriDate(getAdjustedHijriDate(data.date.hijri, country, city));
      await checkAndScheduleNotifications(null, true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch prayer times by GPS.');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadSettings = async () => {
        try {
          const storedToggles = await AsyncStorage.getItem('prayer_alerts');
          if (storedToggles) setPrayerToggles(JSON.parse(storedToggles));

          const storedCity = await AsyncStorage.getItem('prayer_city');
          const storedCountry = await AsyncStorage.getItem('prayer_country');
          const storedGPS = await AsyncStorage.getItem('prayer_use_gps');
          const storedMethod = await AsyncStorage.getItem('prayer_method');
          const storedSchool = await AsyncStorage.getItem('prayer_school');
          const currentMethod = storedMethod ? parseInt(storedMethod, 10) : 1;
          const currentSchool = storedSchool ? parseInt(storedSchool, 10) : 1;
          setMethod(currentMethod);
          setSchool(currentSchool);

          if (storedGPS === 'true') {
            setUseGPS(true);
            const storedLat = await AsyncStorage.getItem('prayer_lat');
            const storedLng = await AsyncStorage.getItem('prayer_lng');
            if (storedLat && storedLng) {
              const currentCity = storedCity || 'Current Location';
              const currentCountry = storedCountry || '';
              setCity(currentCity);
              setCountry(currentCountry);
              setInputCity(currentCity);
              setInputCountry(currentCountry);
              await fetchTimingsByCoords(parseFloat(storedLat), parseFloat(storedLng), currentMethod, currentSchool);
              return;
            }
          }

          const currentCity = storedCity || 'Karachi';
          const currentCountry = storedCountry || 'Pakistan';
          setCity(currentCity);
          setCountry(currentCountry);
          setInputCity(currentCity);
          setInputCountry(currentCountry);
          await fetchTimingsByCity(currentCity, currentCountry, currentMethod, currentSchool);
        } catch (err) {
          console.error('PrayerScreen Error loading settings:', err);
          await fetchTimingsByCity('Karachi', 'Pakistan', 1, 1);
        }
      };
      loadSettings();
      loadDailyAyah();
    }, [translationLang])
  );

  useEffect(() => {
    if (!prayerTimes) return;
    const updateCountdown = () => {
      const info = getCurrentAndNextPrayer(prayerTimes);
      setCurrentPrayerName(info.current);
      setNextPrayerName(info.next);
      setNextPrayerTime(info.nextTime);
      setSecondsLeft(info.secondsLeft);
      setProgress(info.progress);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  const calibrateGPS = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission denied. Please set manually.');
        setIsLoading(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const lat = location.coords.latitude;
      const lng = location.coords.longitude;

      let detectedCity = 'Current Location';
      let detectedCountry = '';
      try {
        const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (geocode && geocode.length > 0) {
          detectedCity = geocode[0].city || geocode[0].subregion || geocode[0].district || 'Current Location';
          detectedCountry = geocode[0].country || '';
        }
      } catch { }

      setCity(detectedCity);
      setCountry(detectedCountry);
      setInputCity(detectedCity);
      setInputCountry(detectedCountry);
      setUseGPS(true);
      setShowConfig(false);

      await AsyncStorage.setItem('prayer_city', detectedCity);
      await AsyncStorage.setItem('prayer_country', detectedCountry);
      await AsyncStorage.setItem('prayer_use_gps', 'true');
      await AsyncStorage.setItem('prayer_lat', lat.toString());
      await AsyncStorage.setItem('prayer_lng', lng.toString());
      await fetchTimingsByCoords(lat, lng, method, school);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to detect location.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveManualLocation = async () => {
    if (!inputCity.trim()) {
      setErrorMsg('City name is required.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    setShowConfig(false);
    setUseGPS(false);
    const finalCity = inputCity.trim();
    const finalCountry = inputCountry.trim() || 'Global';
    try {
      await AsyncStorage.setItem('prayer_city', finalCity);
      await AsyncStorage.setItem('prayer_country', finalCountry);
      await AsyncStorage.setItem('prayer_use_gps', 'false');
      setCity(finalCity);
      setCountry(finalCountry);
      await fetchTimingsByCity(finalCity, finalCountry, method, school);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update location.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (prayerName: string) => {
    const newToggles = { ...prayerToggles, [prayerName]: !prayerToggles[prayerName] };
    setPrayerToggles(newToggles);
    await AsyncStorage.setItem('prayer_alerts', JSON.stringify(newToggles));
    await checkAndScheduleNotifications(null, true);
  };

  return {
    city,
    country,
    hijriDate,
    prayerTimes,
    isLoading,
    errorMsg,
    setErrorMsg,
    inputCity,
    setInputCity,
    inputCountry,
    setInputCountry,
    showConfig,
    setShowConfig,
    useGPS,
    nextPrayerName,
    nextPrayerTime,
    secondsLeft,
    progress,
    currentPrayerName,
    prayerToggles,
    selectedDay,
    setSelectedDay,
    days,
    calibrateGPS,
    saveManualLocation,
    handleToggle,
    dailyAyahData,
    isAyahLoading,
    isDailyAyahEnabled,
  };
};
