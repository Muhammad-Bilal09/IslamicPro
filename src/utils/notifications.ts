import { CalendarDayData } from '@/types/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Platform } from 'react-native';
import { showGlobalAlert } from '../context/alert-context';
import { getOrFetchPrayerCalendar } from './prayerApi';

const EXACT_ALARM_ERROR_PATTERNS = ['exact alarm', 'SecurityException', 'permission', 'not allowed'];

let Notifications: any = null;
try {
  if (Platform.OS !== 'web') {
    Notifications = require('expo-notifications');
  }
} catch (error) {
  console.warn('[NotificationService] Failed to load expo-notifications (expected on Expo Go / Web):', error);
  Notifications = null;
}

if (Notifications && Platform.OS !== 'web') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (err) {
    console.warn('NotificationService Failed to configure notification handler:', err);
  }
}

interface UserLocation {
  city: string;
  country: string;
  useGps: boolean;
  lat?: number;
  lng?: number;
}

export async function configureNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android' && Notifications) {
    try {
      try {
        await Notifications.deleteNotificationChannelAsync('prayer-alerts-default');
        await Notifications.deleteNotificationChannelAsync('prayer-alerts-azan-v3');
        await Notifications.deleteNotificationChannelAsync('prayer-alerts-azan-v4');
        await Notifications.deleteNotificationChannelAsync('prayer-alerts-azan-v5');
        await Notifications.deleteNotificationChannelAsync('prayer-alerts-azan-v6');
      } catch (err) {
        console.warn('NotificationService Failed to delete old channels:', err);
      }

      await Notifications.setNotificationChannelAsync('prayer-alerts-default-v2', {
        name: 'Prayer Alerts (Default Sound)',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        bypassDnd: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        audioAttributes: {
          usage: Notifications.AndroidAudioUsage.NOTIFICATION,
          contentType: Notifications.AndroidAudioContentType.SONIFICATION,
        },
      });
      await Notifications.setNotificationChannelAsync('prayer-alerts-azan-v7', {
        name: 'Prayer Alerts (Adhan Sound)',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'azan',
        bypassDnd: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        audioAttributes: {
          usage: Notifications.AndroidAudioUsage.NOTIFICATION,
          contentType: Notifications.AndroidAudioContentType.SONIFICATION,
        },
      });
      console.log('NotificationService Android notification channels configured.');
    } catch (err) {
      console.warn('NotificationService Failed to set notification channels:', err);
    }
  }
}
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web' || !Notifications) {
    console.log('NotificationService Notifications are not supported on this platform/client.');
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('NotificationService Error requesting notification permissions:', error);
    return false;
  }
}

export async function cancelAllScheduledNotifications(): Promise<void> {
  if (Platform.OS === 'web' || !Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('NotificationService Cancelled all scheduled notifications.');
  } catch (error) {
    console.error('NotificationService Error cancelling notifications:', error);
  }
}

export async function schedulePrayerNotifications(
  timings?: Record<string, string>,
  toggles?: Record<string, boolean>
): Promise<void> {
  if (Platform.OS === 'web' || !Notifications) {
    console.log('NotificationService Local notifications disabled (Expo Go/Web limitations).');
    return;
  }

  try {
    await cancelAllScheduledNotifications();

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('NotificationService No notification permissions granted. Cannot schedule.');
      return;
    }

    const globalRemindersVal = await AsyncStorage.getItem('prayer_reminders_enabled');
    const globalRemindersEnabled = globalRemindersVal !== 'false';
    if (!globalRemindersEnabled) {
      console.log('NotificationService Global prayer reminders disabled. Cancelled all alerts.');
      return;
    }

    await configureNotificationChannel();

    let activeToggles = toggles;
    if (!activeToggles) {
      const storedToggles = await AsyncStorage.getItem('prayer_alerts');
      activeToggles = storedToggles ? JSON.parse(storedToggles) : {
        Fajr: true,
        Sunrise: false,
        Dhuhr: true,
        Asr: true,
        Maghrib: true,
        Isha: true,
      };
    }
    const storedAdhanSound = await AsyncStorage.getItem('adhan_sound_enabled');
    const isAdhanSoundEnabled = storedAdhanSound !== 'false';

    const channelId = isAdhanSoundEnabled ? 'prayer-alerts-azan-v7' : 'prayer-alerts-default-v2';
    const soundFile = isAdhanSoundEnabled ? (Platform.OS === 'ios' ? 'azan.wav' : 'azan') : undefined;

    const storedCity = await AsyncStorage.getItem('prayer_city');
    const storedCountry = await AsyncStorage.getItem('prayer_country');
    const storedUseGps = await AsyncStorage.getItem('prayer_use_gps');
    const storedLat = await AsyncStorage.getItem('prayer_lat');
    const storedLng = await AsyncStorage.getItem('prayer_lng');
    const storedMethod = await AsyncStorage.getItem('prayer_method');
    const storedSchool = await AsyncStorage.getItem('prayer_school');

    const city = storedCity || 'London';
    const country = storedCountry || 'United Kingdom';
    const useGps = storedUseGps === 'true';
    const lat = storedLat ? parseFloat(storedLat) : undefined;
    const lng = storedLng ? parseFloat(storedLng) : undefined;
    const methodId = storedMethod ? parseInt(storedMethod, 10) : 1;
    const schoolId = storedSchool ? parseInt(storedSchool, 10) : 1;

    const enabledPrayersCount = Object.values(activeToggles || {}).filter(Boolean).length;
    let daysToScheduleCount = Platform.OS === 'android' ? 30 : 10;

    if (Platform.OS === 'ios') {
      const totalToSchedule = enabledPrayersCount * daysToScheduleCount;
      if (totalToSchedule > 60) {
        console.warn(`NotificationService Total notifications (${totalToSchedule}) would exceed safe iOS limit of 60. Trimming days to schedule.`);
        daysToScheduleCount = Math.floor(60 / Math.max(1, enabledPrayersCount));
      }
    }

    const datesToSchedule: Date[] = [];
    for (let i = 0; i < daysToScheduleCount; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      datesToSchedule.push(d);
    }

    const monthsNeeded: { year: number; month: number }[] = [];
    for (const d of datesToSchedule) {
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      if (!monthsNeeded.some(item => item.year === y && item.month === m)) {
        monthsNeeded.push({ year: y, month: m });
      }
    }

    const calendars: Record<string, CalendarDayData[]> = {};
    for (const item of monthsNeeded) {
      try {
        const calData = await getOrFetchPrayerCalendar(
          city, country, useGps, lat, lng, methodId, schoolId, item.year, item.month
        );
        calendars[`${item.year}-${item.month}`] = calData;
      } catch (err) {
        console.error(`NotificationService Error getting calendar for ${item.year}-${item.month}:`, err);
      }
    }

    let scheduleCount = 0;
    let exactAlarmPermissionDenied = false;

    for (const targetDate of datesToSchedule) {
      if (exactAlarmPermissionDenied) break;
      const y = targetDate.getFullYear();
      const m = targetDate.getMonth() + 1;
      const dayNum = targetDate.getDate();

      const cal = calendars[`${y}-${m}`];
      const dayTimings = cal && cal[dayNum - 1] ? cal[dayNum - 1].timings : (targetDate.toDateString() === new Date().toDateString() ? timings : null);

      if (!dayTimings) continue;

      for (const [prayerName, isEnabled] of Object.entries(activeToggles || {})) {
        if (exactAlarmPermissionDenied) break;
        if (!isEnabled) continue;

        const timeStr = dayTimings[prayerName];
        if (!timeStr) continue;

        const cleanTimeStr = timeStr.split(' ')[0];
        const timeParts = cleanTimeStr.split(':');
        if (timeParts.length < 2) continue;

        const hour = parseInt(timeParts[0], 10);
        const minute = parseInt(timeParts[1], 10);

        if (isNaN(hour) || isNaN(minute)) continue;

        const triggerDate = new Date(targetDate);
        triggerDate.setHours(hour, minute, 0, 0);

        if (triggerDate.getTime() > Date.now()) {
          try {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: `Prayer Alert: ${prayerName}`,
                body: `It's time for ${prayerName} prayer.`,
                sound: soundFile,
                data: { prayerName },
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: triggerDate,
                channelId,
              },
            });
            scheduleCount++;
          } catch (error: any) {
            console.error(`NotificationService Error scheduling ${prayerName} notification for ${triggerDate.toLocaleString()}:`, error);
            const errMsg = error?.message || '';
            if (
              Platform.OS === 'android' &&
              EXACT_ALARM_ERROR_PATTERNS.some((pattern) => errMsg.includes(pattern))
            ) {
              exactAlarmPermissionDenied = true;
              break;
            }
          }
        }
      }
    }

    console.log(`NotificationService Successfully scheduled ${scheduleCount} notifications for the next ${daysToScheduleCount} days.`);

    if (exactAlarmPermissionDenied) {
      showGlobalAlert(
        'Alarms & Reminders Permission',
        'To play the Adhan exactly at prayer times, Ameen needs the "Alarms & reminders" permission. Please enable it in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              if (Platform.OS === 'android') {
                Linking.sendIntent('android.settings.REQUEST_SCHEDULE_EXACT_ALARM', [
                  { key: 'data', value: 'package:com.r_bilal.Ameen' }
                ]).catch((err) => {
                  console.warn('NotificationService Failed to open exact alarm settings via intent, falling back to openSettings:', err);
                  Linking.openSettings();
                });
              } else {
                Linking.openSettings();
              }
            }
          }
        ]
      );
    }

    if (!exactAlarmPermissionDenied && scheduleCount > 0) {
      const todayStr = getTodayDateString();
      await AsyncStorage.setItem('last_scheduled_date', todayStr);
    }

  } catch (globalErr) {
    console.error('NotificationService General error scheduling notifications:', globalErr);
  }
}

export async function checkAndScheduleNotifications(
  location?: UserLocation | null,
  force = false
): Promise<void> {
  try {
    const todayStr = getTodayDateString();
    const lastScheduledDate = await AsyncStorage.getItem('last_scheduled_date');

    if (!force && lastScheduledDate === todayStr) {
      console.log('NotificationService Notifications already scheduled for today. Skipping check.');
      const activeCount = await getScheduledNotificationsCount();
      console.log(`NotificationService Current active notifications in OS: ${activeCount}`);
      return;
    }

    console.log('NotificationService Triggering scheduler (force = ' + force + ').');
    await schedulePrayerNotifications();

    const activeCount = await getScheduledNotificationsCount();
    console.log(`NotificationService Reschedule completed. Current active notifications in OS: ${activeCount}`);
  } catch (error) {
    console.error('NotificationService Error in checkAndScheduleNotifications:', error);
  }
}

function getTodayDateString(): string {
  const d = new Date();
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
}

export async function triggerTestNotification(): Promise<string | null> {
  if (Platform.OS === 'web' || !Notifications) {
    console.log('NotificationService Notifications are not supported on this platform/client.');
    return null;
  }

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('NotificationService No notification permissions granted for test alert.');
      return null;
    }

    await configureNotificationChannel();

    const storedAdhanSound = await AsyncStorage.getItem('adhan_sound_enabled');
    const isAdhanSoundEnabled = storedAdhanSound !== 'false';

    const channelId = isAdhanSoundEnabled ? 'prayer-alerts-azan-v7' : 'prayer-alerts-default-v2';
    const soundFile = isAdhanSoundEnabled ? (Platform.OS === 'ios' ? 'azan.wav' : 'azan') : undefined;

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: isAdhanSoundEnabled ? 'Test Adhan Alert 🕌' : 'Test Prayer Alert 🔔',
        body: isAdhanSoundEnabled
          ? 'This is a test prayer notification with Adhan sound.'
          : 'This is a test prayer notification with default sound.',
        sound: soundFile,
        data: { prayerName: 'Test' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
        channelId,
      },
    });

    console.log(`NotificationService Test notification scheduled in 5 seconds (ID: ${identifier})`);
    return identifier;
  } catch (error) {
    console.error('NotificationService Error triggering test notification:', error);
    return null;
  }
}

export async function getScheduledNotificationsCount(): Promise<number> {
  if (Platform.OS === 'web' || !Notifications) return 0;
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled.length;
  } catch (error) {
    console.error('NotificationService Error getting scheduled notifications count:', error);
    return 0;
  }
}
