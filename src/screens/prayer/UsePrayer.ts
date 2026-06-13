import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { checkAndScheduleNotifications } from '@/utils/notifications';
import { DayItem } from '@/types/type';
import {
  fetchPrayerTimesByCity,
  fetchPrayerTimesByCoords,
  getCurrentAndNextPrayer,
  PrayerTimings,
} from '@/utils/prayerApi';

export function formatCountdown(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(safeSeconds / 3600);
  const m = Math.floor((safeSeconds % 3600) / 60);
  const s = safeSeconds % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, '0')).join(':');
}

export const usePrayer = () => {
  const [city, setCity] = useState('London');
  const [country, setCountry] = useState('United Kingdom');
  const [method, setMethod] = useState(2);
  const [school, setSchool] = useState(0);
  const [hijriDate, setHijriDate] = useState('Loading Date...');
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimings | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [inputCity, setInputCity] = useState('London');
  const [inputCountry, setInputCountry] = useState('United Kingdom');
  const [showConfig, setShowConfig] = useState(false);
  const [useGPS, setUseGPS] = useState(false);

  const [nextPrayerName, setNextPrayerName] = useState('...');
  const [nextPrayerTime, setNextPrayerTime] = useState('...');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentPrayerName, setCurrentPrayerName] = useState('...');

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
      setHijriDate(`${data.date.hijri.day} ${data.date.hijri.month.en} ${data.date.hijri.year} AH`);
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
      setHijriDate(`${data.date.hijri.day} ${data.date.hijri.month.en} ${data.date.hijri.year} AH`);
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
          const currentMethod = storedMethod ? parseInt(storedMethod, 10) : 2;
          const currentSchool = storedSchool ? parseInt(storedSchool, 10) : 0;
          setMethod(currentMethod);
          setSchool(currentSchool);

          if (storedGPS === 'true') {
            setUseGPS(true);
            const storedLat = await AsyncStorage.getItem('prayer_lat');
            const storedLng = await AsyncStorage.getItem('prayer_lng');
            if (storedLat && storedLng) {
              await fetchTimingsByCoords(parseFloat(storedLat), parseFloat(storedLng), currentMethod, currentSchool);
              return;
            }
          }

          const currentCity = storedCity || 'London';
          const currentCountry = storedCountry || 'United Kingdom';
          setCity(currentCity);
          setCountry(currentCountry);
          setInputCity(currentCity);
          setInputCountry(currentCountry);
          await fetchTimingsByCity(currentCity, currentCountry, currentMethod, currentSchool);
        } catch (err) {
          console.error('[PrayerScreen] Error loading settings:', err);
          await fetchTimingsByCity('London', 'United Kingdom', 2, 0);
        }
      };
      loadSettings();
    }, [school])
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
  };
};
