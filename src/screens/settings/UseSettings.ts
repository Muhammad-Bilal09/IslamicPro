import { useAlert } from '@/context/alert-context';
import { useAuth } from '@/context/auth-context';
import { checkAndScheduleNotifications, getScheduledNotificationsCount, triggerTestNotification } from '@/utils/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

export const METHOD_NAMES: Record<number, string> = {
  1: 'Karachi',
  2: 'North America',
  3: 'MWL',
  4: 'Makkah',
  5: 'Egypt',
  8: 'Gulf',
  11: 'Singapore',
  13: 'Turkey',
};

export const SCHOOL_NAMES: Record<number, string> = {
  0: 'Shafi',
  1: 'Hanafi',
};

export const useSettings = () => {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { logout } = useAuth();

  const player = useAudioPlayer(require('../../../assets/sounds/azan.wav'));
  const playerStatus = useAudioPlayerStatus(player);
  const isPlaying = playerStatus.playing;

  const [prayerReminder, setPrayerReminder] = useState(true);
  const [dailyAyah, setDailyAyah] = useState(true);
  const [sound, setSound] = useState(true);
  const [calculationMethod, setCalculationMethod] = useState(2);
  const [juristicSchool, setJuristicSchool] = useState(0);

  useEffect(() => {
    return () => {
      try {
        player.pause();
      } catch (_) { }
    };
  }, [player]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedReminder = await AsyncStorage.getItem('prayer_reminders_enabled');
        if (storedReminder !== null) {
          setPrayerReminder(storedReminder === 'true');
        }
        const storedAdhanSound = await AsyncStorage.getItem('adhan_sound_enabled');
        if (storedAdhanSound !== null) {
          setSound(storedAdhanSound === 'true');
        }
        const storedDailyAyah = await AsyncStorage.getItem('daily_ayah_enabled');
        if (storedDailyAyah !== null) {
          setDailyAyah(storedDailyAyah === 'true');
        }
        const storedMethod = await AsyncStorage.getItem('prayer_method');
        if (storedMethod !== null) {
          setCalculationMethod(parseInt(storedMethod, 10));
        }
        const storedSchool = await AsyncStorage.getItem('prayer_school');
        if (storedSchool !== null) {
          setJuristicSchool(parseInt(storedSchool, 10));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  const handleToggleReminder = async () => {
    const newVal = !prayerReminder;
    setPrayerReminder(newVal);
    try {
      await AsyncStorage.setItem('prayer_reminders_enabled', newVal ? 'true' : 'false');
      await checkAndScheduleNotifications(null, true);
    } catch (error) {
      console.error('Failed to save prayer reminders setting:', error);
    }
  };

  const handleToggleSound = async () => {
    const newVal = !sound;
    setSound(newVal);
    try {
      await AsyncStorage.setItem('adhan_sound_enabled', newVal ? 'true' : 'false');
      await checkAndScheduleNotifications(null, true);
    } catch (error) {
      console.error('Failed to save adhan sound setting:', error);
    }
  };

  const handleToggleDailyAyah = async () => {
    const newVal = !dailyAyah;
    setDailyAyah(newVal);
    try {
      await AsyncStorage.setItem('daily_ayah_enabled', newVal ? 'true' : 'false');
    } catch (error) {
      console.error('Failed to save daily ayah setting:', error);
    }
  };

  const handleTestAlert = async () => {
    const id = await triggerTestNotification();
    if (id) {
      const count = await getScheduledNotificationsCount();
      showAlert(
        'Test Alert Scheduled ✅',
        `You will receive a test prayer notification in 5 seconds. Please put the app in the background.

Active scheduled alerts in system: ${count}`,
        [{ text: 'OK' }]
      );
    } else {
      showAlert(
        'Alert Failed ❌',
        'Could not schedule notification. Please check that notification permissions are enabled for this app in your device settings.',
        [{ text: 'OK' }]
      );
    }
  };

  const updateMethod = async (methodId: number) => {
    setCalculationMethod(methodId);
    try {
      await AsyncStorage.setItem('prayer_method', methodId.toString());
      await checkAndScheduleNotifications(null, true);
    } catch (error) {
      console.error('Failed to save calculation method:', error);
    }
  };

  const handleSelectMethod = () => {
    showAlert(
      'Calculation Method',
      'Choose calculation authority:',
      [
        { text: 'Karachi ', onPress: () => updateMethod(1) },
        { text: 'North America', onPress: () => updateMethod(2) },
        {
          text: 'More Options...',
          onPress: () => {
            showAlert(
              'More Calculation Methods',
              'Choose calculation authority:',
              [
                { text: 'MWL', onPress: () => updateMethod(3) },
                { text: 'Makkah', onPress: () => updateMethod(4) },
                { text: 'Egypt', onPress: () => updateMethod(5) },
              ]
            );
          }
        },
      ]
    );
  };

  const updateSchool = async (schoolId: number) => {
    setJuristicSchool(schoolId);
    try {
      await AsyncStorage.setItem('prayer_school', schoolId.toString());
      await checkAndScheduleNotifications(null, true);
    } catch (error) {
      console.error('Failed to save juristic school:', error);
    }
  };

  const handleSelectSchool = () => {
    showAlert(
      'Select Juristic School (Asr)',
      'Choose the school for calculating Asr prayer time:',
      [
        {
          text: 'Shafi',
          onPress: () => updateSchool(0),
        },
        {
          text: 'Hanafi',
          onPress: () => updateSchool(1),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return {
    router,
    player,
    isPlaying,
    prayerReminder,
    dailyAyah,
    handleToggleDailyAyah,
    sound,
    calculationMethod,
    juristicSchool,
    handleToggleReminder,
    handleToggleSound,
    handleTestAlert,
    handleSelectMethod,
    handleSelectSchool,
    logout,
  };
};
