import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { CalendarDayData, getOrFetchPrayerCalendar } from './prayerApi';

let Notifications: any = null;
try {
  if (Platform.OS !== 'web') {
    // Dynamically require to avoid crash during app initialization in Expo Go
    Notifications = require('expo-notifications');
  }
} catch (error) {
  console.warn('[NotificationService] Failed to load expo-notifications (expected on Expo Go / Web):', error);
  Notifications = null;
}

// Set up the notification handler behaviors if loaded
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
    console.warn('[NotificationService] Failed to configure notification handler:', err);
  }
}

interface UserLocation {
  city: string;
  country: string;
  useGps: boolean;
  lat?: number;
  lng?: number;
}

/**
 * Configure the Android notification channel for prayer alerts.
 */
export async function configureNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android' && Notifications) {
    try {
      await Notifications.setNotificationChannelAsync('prayer-alerts', {
        name: 'Prayer Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
      console.log('[NotificationService] Android notification channel configured.');
    } catch (err) {
      console.warn('[NotificationService] Failed to set notification channel:', err);
    }
  }
}

/**
 * Requests permission for local notifications.
 * Returns true if permission is granted, false otherwise.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web' || !Notifications) {
    console.log('[NotificationService] Notifications are not supported on this platform/client.');
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('[NotificationService] Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Cancels all scheduled local notifications.
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  if (Platform.OS === 'web' || !Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[NotificationService] Cancelled all scheduled notifications.');
  } catch (error) {
    console.error('[NotificationService] Error cancelling notifications:', error);
  }
}

/**
 * Schedules notifications for the next 10 days based on cached/fetched calendar timings.
 * Falls back to scheduling only today's timings if calendar fetch fails.
 */
export async function schedulePrayerNotifications(
  timings?: Record<string, string>,
  toggles?: Record<string, boolean>
): Promise<void> {
  if (Platform.OS === 'web' || !Notifications) {
    console.log('[NotificationService] Local notifications disabled (Expo Go/Web limitations).');
    return;
  }

  try {
    // 1. Cancel previous notifications to prevent duplicates
    await cancelAllScheduledNotifications();

    // 2. Request permission first
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('[NotificationService] No notification permissions granted. Cannot schedule.');
      return;
    }

    // 3. Configure Android notification channel
    await configureNotificationChannel();

    // 4. Resolve toggles
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

    // 5. Get location info from AsyncStorage
    const storedCity = await AsyncStorage.getItem('prayer_city');
    const storedCountry = await AsyncStorage.getItem('prayer_country');
    const storedUseGps = await AsyncStorage.getItem('prayer_use_gps');
    const storedLat = await AsyncStorage.getItem('prayer_lat');
    const storedLng = await AsyncStorage.getItem('prayer_lng');
    const storedMethod = await AsyncStorage.getItem('prayer_method');

    const city = storedCity || 'London';
    const country = storedCountry || 'United Kingdom';
    const useGps = storedUseGps === 'true';
    const lat = storedLat ? parseFloat(storedLat) : undefined;
    const lng = storedLng ? parseFloat(storedLng) : undefined;
    const methodId = storedMethod ? parseInt(storedMethod, 10) : 2;

    // Generate date list for the next 10 days
    const datesToSchedule: Date[] = [];
    for (let i = 0; i < 10; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      datesToSchedule.push(d);
    }

    // Group dates by year and month to minimize calendar fetching
    const monthsNeeded: { year: number; month: number }[] = [];
    for (const d of datesToSchedule) {
      const y = d.getFullYear();
      const m = d.getMonth() + 1; // 1-indexed
      if (!monthsNeeded.some(item => item.year === y && item.month === m)) {
        monthsNeeded.push({ year: y, month: m });
      }
    }

    // Load monthly calendars
    const calendars: Record<string, CalendarDayData[]> = {};
    for (const item of monthsNeeded) {
      try {
        const calData = await getOrFetchPrayerCalendar(
          city, country, useGps, lat, lng, methodId, item.year, item.month
        );
        calendars[`${item.year}-${item.month}`] = calData;
      } catch (err) {
        console.error(`[NotificationService] Error getting calendar for ${item.year}-${item.month}:`, err);
      }
    }

    let scheduleCount = 0;

    // Schedule notifications for each of the 10 days
    for (const targetDate of datesToSchedule) {
      const y = targetDate.getFullYear();
      const m = targetDate.getMonth() + 1;
      const dayNum = targetDate.getDate();

      const cal = calendars[`${y}-${m}`];
      // If we don't have calendar data for this day, fallback to current day's timings if provided
      const dayTimings = cal && cal[dayNum - 1] ? cal[dayNum - 1].timings : (targetDate.toDateString() === new Date().toDateString() ? timings : null);

      if (!dayTimings) continue;

      for (const [prayerName, isEnabled] of Object.entries(activeToggles || {})) {
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

        // Schedule only future alerts
        if (triggerDate.getTime() > Date.now()) {
          try {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: `Prayer Alert: ${prayerName}`,
                body: `It's time for ${prayerName} prayer.`,
                sound: 'default',
                data: { prayerName },
                ...(Platform.OS === 'android' ? { channelId: 'prayer-alerts' } : {}),
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: triggerDate,
              },
            });
            scheduleCount++;
          } catch (error) {
            console.error(`[NotificationService] Error scheduling ${prayerName} notification for ${triggerDate.toLocaleString()}:`, error);
          }
        }
      }
    }

    console.log(`[NotificationService] Successfully scheduled ${scheduleCount} notifications for the next 10 days.`);

    // Save scheduling date to prevent redundant runs on the same day
    const todayStr = getTodayDateString();
    await AsyncStorage.setItem('last_scheduled_date', todayStr);

  } catch (globalErr) {
    console.error('[NotificationService] General error scheduling notifications:', globalErr);
  }
}

/**
 * Checks if the notification scheduler has run today. If not, or if force is true, schedules them.
 */
export async function checkAndScheduleNotifications(
  location?: UserLocation | null,
  force = false
): Promise<void> {
  try {
    const todayStr = getTodayDateString();
    const lastScheduledDate = await AsyncStorage.getItem('last_scheduled_date');

    if (!force && lastScheduledDate === todayStr) {
      console.log('[NotificationService] Notifications already scheduled for today. Skipping check.');
      return;
    }

    console.log('[NotificationService] Triggering scheduler (force = ' + force + ').');
    await schedulePrayerNotifications();
  } catch (error) {
    console.error('[NotificationService] Error in checkAndScheduleNotifications:', error);
  }
}

/**
 * Helper to get date string in YYYY-MM-DD format based on local time.
 */
function getTodayDateString(): string {
  const d = new Date();
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
}

/**
 * Triggers a test notification after 5 seconds.
 */
export async function triggerTestNotification(): Promise<string | null> {
  if (Platform.OS === 'web' || !Notifications) {
    console.log('[NotificationService] Notifications are not supported on this platform/client.');
    return null;
  }

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('[NotificationService] No notification permissions granted for test alert.');
      return null;
    }

    await configureNotificationChannel();

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Adhan Alert 🕌',
        body: 'This is a test prayer notification from IslamicPro.',
        sound: 'default',
        data: { prayerName: 'Test' },
        ...(Platform.OS === 'android' ? { channelId: 'prayer-alerts' } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
      },
    });

    console.log(`[NotificationService] Test notification scheduled in 5 seconds (ID: ${identifier})`);
    return identifier;
  } catch (error) {
    console.error('[NotificationService] Error triggering test notification:', error);
    return null;
  }
}
