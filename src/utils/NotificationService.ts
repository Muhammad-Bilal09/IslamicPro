import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { PrayerNotificationScheduler } from './PrayerNotificationScheduler';

const OS = Platform.OS as string;

const BACKGROUND_PRAYER_NOTIFICATION_TASK = 'background-prayer-notification-task';

if (OS !== 'web' && TaskManager) {
  try {
    TaskManager.defineTask(BACKGROUND_PRAYER_NOTIFICATION_TASK, async () => {
      try {
        console.log('[BackgroundTask] Running background prayer scheduler...');
        await PrayerNotificationScheduler.schedulePrayerNotifications();
      } catch (error) {
        console.error('[BackgroundTask] Task failed:', error);
      }
    });
  } catch (err) {
    console.warn('[NotificationService] TaskManager defineTask failed:', err);
  }
}

export class NotificationService {
  static async registerBackgroundNotificationTask(): Promise<void> {
    if (OS === 'web') return;
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_PRAYER_NOTIFICATION_TASK);
      if (!isRegistered) {
        await BackgroundTask.registerTaskAsync(BACKGROUND_PRAYER_NOTIFICATION_TASK, {
          minimumInterval: 900,
        });
        console.log('[BackgroundTask] Registered background task successfully with 15-min interval.');
      } else {
        console.log('[BackgroundTask] Background task is already registered.');
      }
    } catch (error) {
      console.error('[BackgroundTask] Registration failed:', error);
    }
  }
}
