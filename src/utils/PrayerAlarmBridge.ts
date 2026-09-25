import { NativeModules, Platform } from 'react-native';

const { PrayerAlarmModule } = NativeModules;
const OS = Platform.OS as string;

export class PrayerAlarmBridge {
  static async scheduleExactAlarm(
    alarmId: string,
    prayerName: string,
    timestamp: number,
    soundEnabled: boolean = true
  ): Promise<boolean> {
    if (OS !== 'android' || !PrayerAlarmModule) {
      return false;
    }
    try {
      return await PrayerAlarmModule.scheduleExactAlarm(alarmId, prayerName, timestamp, soundEnabled);
    } catch (e) {
      console.error('[PrayerAlarmBridge] Error scheduling exact alarm:', e);
      return false;
    }
  }

  static async cancelAlarm(alarmId: string): Promise<boolean> {
    if (OS !== 'android' || !PrayerAlarmModule) {
      return false;
    }
    try {
      return await PrayerAlarmModule.cancelAlarm(alarmId);
    } catch (e) {
      console.error('[PrayerAlarmBridge] Error cancelling alarm:', e);
      return false;
    }
  }

  static async canScheduleExactAlarms(): Promise<boolean> {
    if (OS !== 'android' || !PrayerAlarmModule) {
      return true;
    }
    try {
      return await PrayerAlarmModule.canScheduleExactAlarms();
    } catch (_) {
      return true;
    }
  }

  static async openExactAlarmSettings(): Promise<boolean> {
    if (OS !== 'android' || !PrayerAlarmModule) {
      return false;
    }
    try {
      return await PrayerAlarmModule.openExactAlarmSettings();
    } catch (_) {
      return false;
    }
  }

  static async isIgnoringBatteryOptimizations(): Promise<boolean> {
    if (OS !== 'android' || !PrayerAlarmModule) {
      return true;
    }
    try {
      return await PrayerAlarmModule.isIgnoringBatteryOptimizations();
    } catch (_) {
      return true;
    }
  }

  static async openBatteryOptimizationSettings(): Promise<boolean> {
    if (OS !== 'android' || !PrayerAlarmModule) {
      return false;
    }
    try {
      return await PrayerAlarmModule.openBatteryOptimizationSettings();
    } catch (_) {
      return false;
    }
  }

  static async getDeviceManufacturer(): Promise<string> {
    if (OS !== 'android' || !PrayerAlarmModule) {
      return '';
    }
    try {
      return await PrayerAlarmModule.getDeviceManufacturer();
    } catch (_) {
      return '';
    }
  }

  static async openOEMAutostartSettings(): Promise<boolean> {
    if (OS !== 'android' || !PrayerAlarmModule) {
      return false;
    }
    try {
      return await PrayerAlarmModule.openOEMAutostartSettings();
    } catch (_) {
      return false;
    }
  }
}

