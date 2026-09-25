import { useAlert } from '@/context/alert-context';
import { useAuth } from '@/context/auth-context';
import { Platform, Linking } from 'react-native';
import {
  checkAndScheduleNotifications,
  getScheduledNotificationsCount,
} from '@/utils/notifications';
import { PermissionService } from '@/utils/PermissionService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useRouter } from 'expo-router';
import { FCMManager } from '@/utils/FCMManager';
import { getStoredArabicFont, setStoredArabicFont, ARABIC_FONTS } from '@/utils/fontHelper';
import { useEffect, useState } from 'react';

export const METHOD_NAMES: Record<number, string> = {
  1: 'Karachi',
  2: 'ISNA',
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
  const [calculationMethod, setCalculationMethod] = useState(1);
  const [juristicSchool, setJuristicSchool] = useState(1);
  const [arabicFont, setArabicFont] = useState<'Amiri-Regular' | 'DigitalKhattIndoPak' | 'ScheherazadeNew-Regular'>('DigitalKhattIndoPak');

  const [exactAlarmAllowed, setExactAlarmAllowed] = useState(true);
  const [batteryOptEnabled, setBatteryOptEnabled] = useState(false);
  const [isOEM, setIsOEM] = useState(false);
  const [manufacturer, setManufacturer] = useState('');
  const [activeTriggersCount, setActiveTriggersCount] = useState(0);
  const [notificationPermissionGranted, setNotificationPermissionGranted] = useState(true);

  const checkDiagnostics = async () => {
    const exact = await PermissionService.canScheduleExactAlarms();
    const battery = await PermissionService.isBatteryOptimizationEnabled();
    const oem = await PermissionService.isOEMDevice();
    const m = await PermissionService.getDeviceManufacturer();
    const count = await getScheduledNotificationsCount();
    const pushPermission = await PermissionService.getNotificationPermissionStatus();
    setExactAlarmAllowed(exact);
    setBatteryOptEnabled(battery);
    setIsOEM(oem);
    setManufacturer(m);
    setActiveTriggersCount(count);
    setNotificationPermissionGranted(pushPermission);
  };

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
        const storedFont = await getStoredArabicFont();
        setArabicFont(storedFont);
        await checkDiagnostics();
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  const handleOpenAlarmSettings = async () => {
    PermissionService.promptExactAlarmPermission();
  };

  const handleOpenBatterySettings = async () => {
    PermissionService.openBatteryOptimizationSettings();
  };

  const handleOpenOEMAutostart = async () => {
    PermissionService.openOEMAutostartSettings();
  };

  const handleRequestNotificationPermission = async () => {
    const granted = await PermissionService.requestNotificationPermissions();
    if (!granted) {
      showAlert(
        'Notification Permission',
        'Please enable notifications in System Settings to receive prayer alerts.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              Linking.openSettings();
            }
          }
        ]
      );
    } else {
      await checkDiagnostics();
      try {
        await checkAndScheduleNotifications(null, true);
      } catch (_) {}
    }
  };

  const handleRegisterFCMToken = async () => {
    try {
      const token = await FCMManager.registerFCMToken();
      if (token) {
        const preview = `${token.substring(0, 12)}...${token.substring(token.length - 8)}`;
        showAlert('FCM Token Synced', `Real Device FCM Token generated & registered with server!\n\nToken: ${preview}`);
      } else {
        showAlert('FCM Sync Notice', 'Push permissions required or web platform detected.');
      }
    } catch (e: any) {
      showAlert('FCM Sync Error', e?.message || String(e));
    }
  };

  const handleToggleReminder = async () => {
    const newVal = !prayerReminder;
    setPrayerReminder(newVal);
    try {
      await AsyncStorage.setItem('prayer_reminders_enabled', newVal ? 'true' : 'false');
      if (newVal) {
        const hasPermission = await PermissionService.requestNotificationPermissions();
        if (hasPermission) {
          const canExact = await PermissionService.canScheduleExactAlarms();
          if (!canExact) {
            PermissionService.promptExactAlarmPermission();
          }
        }
      }
      await checkAndScheduleNotifications(null, true);
      await checkDiagnostics();
    } catch (error) {
      console.error('Failed to save prayer_reminders_enabled:', error);
    }
  };

  const handleToggleDailyAyah = async () => {
    const newVal = !dailyAyah;
    setDailyAyah(newVal);
    try {
      await AsyncStorage.setItem('daily_ayah_enabled', newVal ? 'true' : 'false');
    } catch (error) {
      console.error('Failed to save daily_ayah_enabled:', error);
    }
  };

  const handleToggleSound = async () => {
    const newVal = !sound;
    setSound(newVal);
    try {
      await AsyncStorage.setItem('adhan_sound_enabled', newVal ? 'true' : 'false');
      if (newVal) {
        try {
          player.play();
        } catch (_) {}
      } else {
        try {
          player.pause();
        } catch (_) {}
      }
      await checkAndScheduleNotifications(null, true);
    } catch (error) {
      console.error('Failed to save adhan_sound_enabled:', error);
    }
  };

  const handleSelectMethod = () => {
    showAlert('Calculation Method', 'Select your preferred calculation method for prayer times:', [
      { text: 'Karachi (University of Islamic Sciences)', onPress: () => updateMethod(1) },
      { text: 'ISNA (North America)', onPress: () => updateMethod(2) },
      { text: 'MWL (Muslim World League)', onPress: () => updateMethod(3) },
      { text: 'Makkah (Umm al-Qura)', onPress: () => updateMethod(4) },
      { text: 'Egyptian General Authority', onPress: () => updateMethod(5) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const updateMethod = async (id: number) => {
    setCalculationMethod(id);
    await AsyncStorage.setItem('prayer_method', id.toString());
    await checkAndScheduleNotifications(null, true);
  };

  const handleSelectSchool = () => {
    showAlert('Juristic School', 'Select Juristic School for Asr prayer calculation:', [
      { text: 'Standard (Shafi\'i, Maliki, Hanbali)', onPress: () => updateSchool(0) },
      { text: 'Hanafi', onPress: () => updateSchool(1) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const updateSchool = async (id: number) => {
    setJuristicSchool(id);
    await AsyncStorage.setItem('prayer_school', id.toString());
    await checkAndScheduleNotifications(null, true);
  };

  const handleSelectArabicFont = () => {
    showAlert('Arabic Font Style', 'Select your preferred font style for Quranic and Arabic text:', [
      { text: 'Amiri', onPress: () => updateArabicFont('Amiri-Regular') },
      { text: 'Indo-Pak', onPress: () => updateArabicFont('DigitalKhattIndoPak') },
      { text: 'Classic Naskh', onPress: () => updateArabicFont('ScheherazadeNew-Regular') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const updateArabicFont = async (font: 'Amiri-Regular' | 'DigitalKhattIndoPak' | 'ScheherazadeNew-Regular') => {
    setArabicFont(font);
    await setStoredArabicFont(font);
  };

  return {
    router,
    prayerReminder,
    dailyAyah,
    handleToggleDailyAyah,
    sound,
    calculationMethod,
    juristicSchool,
    arabicFont,
    handleSelectArabicFont,
    handleToggleReminder,
    handleToggleSound,
    handleSelectMethod,
    handleSelectSchool,
    exactAlarmAllowed,
    batteryOptEnabled,
    isOEM,
    manufacturer,
    activeTriggersCount,
    notificationPermissionGranted,
    handleOpenAlarmSettings,
    handleOpenBatterySettings,
    handleOpenOEMAutostart,
    handleRequestNotificationPermission,
    handleRegisterFCMToken,
    logout,
  };
};
