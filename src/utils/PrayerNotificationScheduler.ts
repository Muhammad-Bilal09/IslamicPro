import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { formatDateString, parseTimeString } from "./DateUtils";
import { NotificationUtils } from "./NotificationUtils";
import { PermissionService } from "./PermissionService";
import { PrayerAlarmBridge } from "./PrayerAlarmBridge";
import { PrayerTimeService } from "./PrayerTimeService";
import { StorageService } from "./StorageService";

const OS = Platform.OS as string;

export class PrayerNotificationScheduler {
  private static schedulingPromise: Promise<void> | null = null;

  /**
   * Schedules exact prayer notifications for 30 full days in advance.
   * Universal Dual Engine:
   * 1. Expo Notifications queue scheduled for ALL platforms (iOS & Android) with Adhan sound ("azan.wav" / "azan").
   * 2. Native AlarmManager setAlarmClock() hardware RTC clock on Android for exact CPU wake-up.
   */
  static async schedulePrayerNotifications(
    toggles?: Record<string, boolean>,
  ): Promise<void> {
    if (OS === "web") {
      console.log(
        "[PrayerNotificationScheduler] Notifications are not supported/disabled on web.",
      );
      return;
    }

    try {
      console.log(
        "[PrayerNotificationScheduler] Starting 30-day exact prayer scheduling process...",
      );

      let hasPermission =
        await PermissionService.getNotificationPermissionStatus();
      if (!hasPermission) {
        console.log(
          "[PrayerNotificationScheduler] Notification permission not granted yet. Requesting from OS...",
        );
        hasPermission =
          await PermissionService.requestNotificationPermissions();
      }

      // Re-verify after permission dialog interaction
      if (!hasPermission) {
        hasPermission =
          await PermissionService.getNotificationPermissionStatus();
      }

      if (!hasPermission) {
        console.warn(
          "[PrayerNotificationScheduler] Notification permissions not granted by user.",
        );
        return;
      }

      const globalRemindersEnabled = await StorageService.getRemindersEnabled();
      if (!globalRemindersEnabled) {
        console.log(
          "[PrayerNotificationScheduler] Global prayer reminders disabled. Cancelling all alerts.",
        );
        await Notifications.cancelAllScheduledNotificationsAsync();
        return;
      }

      const activeToggles =
        toggles || (await StorageService.getPrayerAlertToggles());
      const isAdhanSoundEnabled = await StorageService.getAdhanSoundEnabled();

      await NotificationUtils.configureNotificationChannels();

      const channelId = isAdhanSoundEnabled
        ? "prayer_alarm_channel_v13"
        : "prayer-alerts-default-v11";
      const soundFile = isAdhanSoundEnabled
        ? OS === "android"
          ? "azan"
          : "azan.wav"
        : "default";

      const location = await StorageService.getLocation();
      const { methodId, schoolId } =
        await StorageService.getCalculationSettings();
      const lat = location.lat ?? 24.8607;
      const lng = location.lng ?? 67.0011;

      const currentNow = new Date();
      const currentTimestamp = currentNow.getTime();

      // Schedule 30 days of prayer alarms in advance so user never needs to reopen the app
      const daysToScheduleCount = 30;
      const baseYear = currentNow.getFullYear();
      const baseMonth = currentNow.getMonth();
      const baseDay = currentNow.getDate();

      const datesToSchedule: Date[] = [];
      for (let i = 0; i < daysToScheduleCount; i++) {
        datesToSchedule.push(
          new Date(baseYear, baseMonth, baseDay + i, 0, 0, 0, 0),
        );
      }

      const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

      for (const targetDate of datesToSchedule) {
        const dateStr = formatDateString(targetDate);
        const dayTimings = PrayerTimeService.getPrayerTimesForDate(
          targetDate,
          lat,
          lng,
          methodId,
          schoolId,
        );

        for (const prayerName of prayers) {
          const isEnabled = activeToggles[prayerName] !== false;
          const identifier = `prayer-${prayerName.toLowerCase()}-${dateStr}`;

          if (!isEnabled) {
            try {
              if (OS === "android") {
                await PrayerAlarmBridge.cancelAlarm(identifier);
              }
              await Notifications.cancelScheduledNotificationAsync(identifier);
            } catch (_) {}
            continue;
          }

          const timeStr = dayTimings[prayerName as keyof typeof dayTimings];
          if (!timeStr) continue;

          const parsedTime = parseTimeString(timeStr);
          if (!parsedTime) continue;

          const triggerDate = new Date(targetDate);
          triggerDate.setHours(parsedTime.hour, parsedTime.minute, 0, 0);

          const targetTime = triggerDate.getTime();
          if (targetTime <= currentTimestamp) {
            // Immediately purge any past/expired trigger
            try {
              await Notifications.cancelScheduledNotificationAsync(identifier);
              if (OS === "android") {
                await PrayerAlarmBridge.cancelAlarm(identifier);
              }
            } catch (_) {}
            continue; // Skip past prayer times
          }

          try {
            // 1. Universal Expo Notifications scheduling for ALL platforms (iOS & Android)
            try {
              await Notifications.cancelScheduledNotificationAsync(identifier);
            } catch (_) {}

            await Notifications.scheduleNotificationAsync({
              identifier,
              content: {
                title: `🕌 ${prayerName} Prayer Time`,
                body: `It's time for ${prayerName} Prayer. Begin your Salah.`,
                sound: soundFile,
                data: { prayerName, identifier, targetTimestamp: targetTime },
                ...(OS === "android" ? { channelId } : {}),
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: triggerDate,
                ...(OS === "android" ? { channelId } : {}),
              },
            });

            // 2. On Android, also schedule via Native AlarmManager hardware clock for exact second CPU wake-up
            if (OS === "android") {
              await PrayerAlarmBridge.scheduleExactAlarm(
                identifier,
                prayerName,
                targetTime,
                isAdhanSoundEnabled,
              );
            }
          } catch (err) {
            console.error(
              `[PrayerNotificationScheduler] Failed to schedule exact prayer ${prayerName}:`,
              err,
            );
          }
        }
      }

      console.log(
        `[PrayerNotificationScheduler] Successfully scheduled ${daysToScheduleCount} days of exact prayer alarms on ${OS}!`,
      );
      await this.verifyScheduledNotifications();
    } catch (globalErr) {
      console.error(
        "[PrayerNotificationScheduler] General error scheduling exact notifications:",
        globalErr,
      );
    }
  }

  static async checkAndScheduleNotifications(force = false): Promise<void> {
    if (this.schedulingPromise) {
      console.log(
        "[PrayerNotificationScheduler] Schedule already in progress; reusing it.",
      );
      return this.schedulingPromise;
    }

    this.schedulingPromise = this.schedulePrayerNotifications();
    try {
      console.log(
        `[PrayerNotificationScheduler] Running exact scheduler check (force: ${force})`,
      );
      await this.schedulingPromise;
    } catch (error) {
      console.error(
        "[PrayerNotificationScheduler] Error in checkAndScheduleNotifications:",
        error,
      );
    } finally {
      this.schedulingPromise = null;
    }
  }

  static async getScheduledCount(): Promise<number> {
    if (OS === "web") return 0;
    try {
      const list = await Notifications.getAllScheduledNotificationsAsync();
      return list.length;
    } catch (_) {
      return 0;
    }
  }

  static async getScheduledTriggersDetailed(): Promise<any[]> {
    if (OS === "web") return [];
    try {
      const list = await Notifications.getAllScheduledNotificationsAsync();
      return list.map((item) => ({
        id: item.identifier,
        title: item.content.title,
        body: item.content.body,
        sound: item.content.sound,
        trigger: item.trigger,
      }));
    } catch (error) {
      console.error(
        "[PrayerNotificationScheduler] Error listing scheduled notifications:",
        error,
      );
      return [];
    }
  }

  static async verifyScheduledNotifications(): Promise<void> {
    if (OS === "web") return;
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log(
        "=== EXPO NOTIFICATIONS & NATIVE ALARM QUEUE VERIFICATION ===",
      );
      console.log(`Total Scheduled Notifications in OS: ${scheduled.length}`);
      console.log(
        "===========================================================",
      );
    } catch (err) {
      console.error(
        "[PrayerNotificationScheduler] Error during verification logging:",
        err,
      );
    }
  }
}
