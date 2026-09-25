import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { formatDateString } from './DateUtils';

const OS = Platform.OS as string;

if (OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => {
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      };
    },
  });
}

export class NotificationUtils {
  static getDeterministicId(prayerName: string, date?: Date): string {
    if (date) {
      const dateStr = formatDateString(date);
      return `prayer-${prayerName.toLowerCase()}-${dateStr}`;
    }
    return `prayer-daily-${prayerName.toLowerCase()}`;
  }

  static async configureNotificationChannels(): Promise<void> {
    if (OS !== 'android') {
      return;
    }

    try {
      try {
        await Notifications.deleteNotificationChannelAsync('prayer-alerts-default-v10');
        await Notifications.deleteNotificationChannelAsync('prayer-alerts-azan-v10');
      } catch (_) { }

      await Notifications.setNotificationChannelAsync('prayer-alerts-default-v11', {
        name: 'Prayer Alerts (Default Sound)',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        enableVibrate: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        sound: undefined,
        bypassDnd: true,
      });

      await Notifications.setNotificationChannelAsync('prayer_alarm_channel_v13', {
        name: 'Prayer Alerts (Adhan Sound)',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        enableVibrate: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        sound: 'azan',
        bypassDnd: true,
        audioAttributes: {
          usage: Notifications.AndroidAudioUsage.NOTIFICATION_EVENT,
          contentType: Notifications.AndroidAudioContentType.SONIFICATION,
        },
      });

      await Notifications.setNotificationChannelAsync('prayer-alerts-azan-v11', {
        name: 'Prayer Alerts (Adhan Sound)',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        enableVibrate: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        sound: 'azan',
        bypassDnd: true,
        audioAttributes: {
          usage: Notifications.AndroidAudioUsage.NOTIFICATION_EVENT,
          contentType: Notifications.AndroidAudioContentType.SONIFICATION,
        },
      });

      console.log('[NotificationUtils] Expo Android notification channels configured successfully.');
    } catch (err) {
      console.warn('[NotificationUtils] Failed to set notification channels:', err);
    }
  }
}
