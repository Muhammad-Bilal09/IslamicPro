import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';
import { showGlobalAlert } from '../context/alert-context';
import { PrayerAlarmBridge } from './PrayerAlarmBridge';

const OS = Platform.OS as string;

export class PermissionService {
  static async requestNotificationPermissions(): Promise<boolean> {
    if (OS === 'web') {
      return false;
    }

    try {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

      const isGranted = status === 'granted';

      if (isGranted && OS === 'android') {
        const canExact = await this.canScheduleExactAlarms();
        if (!canExact) {
          this.promptExactAlarmPermission();
        }
      }

      return isGranted;
    } catch (error) {
      console.error('[PermissionService] Error requesting notification permissions:', error);
      return false;
    }
  }

  static async getNotificationPermissionStatus(): Promise<boolean> {
    if (OS === 'web') {
      return false;
    }
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('[PermissionService] Error getting notification settings:', error);
      return false;
    }
  }

  static async canScheduleExactAlarms(): Promise<boolean> {
    if (OS !== 'android') return true;
    try {
      return await PrayerAlarmBridge.canScheduleExactAlarms();
    } catch (_) {
      return true;
    }
  }

  static async isBatteryOptimizationEnabled(): Promise<boolean> {
    if (OS !== 'android') return false;
    try {
      const isIgnoring = await PrayerAlarmBridge.isIgnoringBatteryOptimizations();
      return !isIgnoring;
    } catch (_) {
      return false;
    }
  }

  static async getDeviceManufacturer(): Promise<string> {
    if (OS !== 'android') return '';
    try {
      return await PrayerAlarmBridge.getDeviceManufacturer();
    } catch (_) {
      return '';
    }
  }

  static async isOEMDevice(): Promise<boolean> {
    const m = (await this.getDeviceManufacturer()).toLowerCase();
    return (
      m.includes('xiaomi') ||
      m.includes('redmi') ||
      m.includes('poco') ||
      m.includes('vivo') ||
      m.includes('iqoo') ||
      m.includes('oppo') ||
      m.includes('realme') ||
      m.includes('samsung') ||
      m.includes('huawei') ||
      m.includes('honor')
    );
  }

  static promptExactAlarmPermission() {
    if (OS !== 'android') return;

    showGlobalAlert(
      'Exact Alarm Permission Required',
      'To deliver prayer alerts precisely on time, please enable "Alarms & Reminders" permission for Amin in system settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: async () => {
            const opened = await PrayerAlarmBridge.openExactAlarmSettings();
            if (!opened) {
              try { Linking.openSettings(); } catch (_) { }
            }
          },
        },
      ]
    );
  }

  static openBatteryOptimizationSettings() {
    if (OS !== 'android') return;

    showGlobalAlert(
      'Battery Optimization Exemption',
      'For uninterrupted prayer alerts during phone sleep, select "Unrestricted" battery usage for Amin in system settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Battery Settings',
          onPress: async () => {
            const opened = await PrayerAlarmBridge.openBatteryOptimizationSettings();
            if (!opened) {
              try { Linking.openSettings(); } catch (_) { }
            }
          },
        },
      ]
    );
  }

  static openOEMAutostartSettings() {
    if (OS !== 'android') return;

    showGlobalAlert(
      'OEM Autostart Permission',
      'Your phone manufacturer requires "Autostart" permission so prayer alarms can trigger when the app is closed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Autostart Settings',
          onPress: async () => {
            const opened = await PrayerAlarmBridge.openOEMAutostartSettings();
            if (!opened) {
              try { Linking.openSettings(); } catch (_) { }
            }
          },
        },
      ]
    );
  }
}

