import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import {
  fetchPrayerTimesByCity,
  fetchPrayerTimesByCoords,
  getCurrentAndNextPrayer,
  PrayerTimings,
} from '@/utils/prayerApi';

export const useHome = () => {
  const [city, setCity] = useState('London');
  const [country, setCountry] = useState('United Kingdom');
  const [method, setMethod] = useState(2);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimings | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [currentPrayerName, setCurrentPrayerName] = useState('...');
  const [nextPrayerName, setNextPrayerName] = useState('...');
  const [nextPrayerTime, setNextPrayerTime] = useState('...');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalWaitSeconds, setTotalWaitSeconds] = useState(1);
  const [progress, setProgress] = useState(0);

  const loadSettingsAndTimings = async () => {
    setIsLoading(true);
    try {
      const storedCity = await AsyncStorage.getItem('prayer_city');
      const storedCountry = await AsyncStorage.getItem('prayer_country');
      const storedGPS = await AsyncStorage.getItem('prayer_use_gps');
      const storedMethod = await AsyncStorage.getItem('prayer_method');
      const storedSchool = await AsyncStorage.getItem('prayer_school');

      const currentMethod = storedMethod ? parseInt(storedMethod, 10) : 2;
      const currentSchool = storedSchool ? parseInt(storedSchool, 10) : 0;
      setMethod(currentMethod);

      let data;
      if (storedGPS === 'true') {
        const storedLat = await AsyncStorage.getItem('prayer_lat');
        const storedLng = await AsyncStorage.getItem('prayer_lng');
        if (storedLat && storedLng) {
          data = await fetchPrayerTimesByCoords(parseFloat(storedLat), parseFloat(storedLng), currentMethod, currentSchool);
          setCity(storedCity || 'Current Location');
          setCountry(storedCountry || '');
        }
      }

      if (!data) {
        const currentCity = storedCity || 'London';
        const currentCountry = storedCountry || 'United Kingdom';
        setCity(currentCity);
        setCountry(currentCountry);
        data = await fetchPrayerTimesByCity(currentCity, currentCountry, currentMethod, currentSchool);
      }

      setPrayerTimes(data.timings);
    } catch (err) {
      console.error('[HomeScreen] Error loading timings:', err);
      try {
        const fallbackData = await fetchPrayerTimesByCity('London', 'United Kingdom', 2, 0);
        setPrayerTimes(fallbackData.timings);
        setCity('London');
        setCountry('United Kingdom');
      } catch (fErr) {
        console.error('[HomeScreen] Fallback failed:', fErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSettingsAndTimings();
    }, [])
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
  };
};
