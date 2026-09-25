import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationService } from './NotificationService';
import { NotificationUtils } from './NotificationUtils';
import { PermissionService } from './PermissionService';
import { PrayerNotificationScheduler } from './PrayerNotificationScheduler';

const OS = Platform.OS as string;

export async function configureNotificationChannel(): Promise<void> {
  await NotificationUtils.configureNotificationChannels();
}

export async function requestNotificationPermissions(): Promise<boolean> {
  return await PermissionService.requestNotificationPermissions();
}

export async function cancelAllScheduledNotifications(): Promise<void> {
  if (OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[notifications] Cancelled all scheduled notifications.');
  } catch (error) {
    console.error('[notifications] Error cancelling all notifications:', error);
  }
}

export async function schedulePrayerNotifications(
  timings?: Record<string, string>,
  toggles?: Record<string, boolean>
): Promise<void> {
  await PrayerNotificationScheduler.schedulePrayerNotifications(toggles);
}

export async function cleanupPastNotifications(): Promise<void> {
  if (OS === 'web') return;
  try {
    const delivered = await Notifications.getPresentedNotificationsAsync();
    for (const item of delivered) {
      try {
        await Notifications.dismissNotificationAsync(item.request.identifier);
      } catch (_) { }
    }
  } catch (_) { }
}

export async function checkAndScheduleNotifications(
  location?: any,
  force = false
): Promise<void> {
  await PrayerNotificationScheduler.checkAndScheduleNotifications(force);
}

export async function getScheduledNotificationsCount(): Promise<number> {
  if (OS === 'web') return 0;
  try {
    return await PrayerNotificationScheduler.getScheduledCount();
  } catch (_) {
    return 0;
  }
}

export async function getScheduledTriggersDetailed(): Promise<any[]> {
  if (OS === 'web') return [];
  try {
    return await PrayerNotificationScheduler.getScheduledTriggersDetailed();
  } catch (_) {
    return [];
  }
}

export async function registerBackgroundNotificationTask(): Promise<void> {
  await NotificationService.registerBackgroundNotificationTask();
}
