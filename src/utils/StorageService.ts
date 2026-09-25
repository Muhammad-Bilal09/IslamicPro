import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserLocation {
  city: string;
  country: string;
  useGps: boolean;
  lat?: number;
  lng?: number;
}

export interface PrayerAlertToggles {
  [key: string]: boolean;
  Fajr: boolean;
  Sunrise: boolean;
  Dhuhr: boolean;
  Asr: boolean;
  Maghrib: boolean;
  Isha: boolean;
}

export const StorageKeys = {
  REMINDERS_ENABLED: 'prayer_reminders_enabled',
  ADHAN_SOUND_ENABLED: 'adhan_sound_enabled',
  PRAYER_ALERTS: 'prayer_alerts',
  CITY: 'prayer_city',
  COUNTRY: 'prayer_country',
  USE_GPS: 'prayer_use_gps',
  LATITUDE: 'prayer_lat',
  LONGITUDE: 'prayer_lng',
  METHOD: 'prayer_method',
  SCHOOL: 'prayer_school',
  LAST_SCHEDULED_DATE: 'last_scheduled_date',
  LAST_TIMEZONE_OFFSET: 'last_timezone_offset',
};

export class StorageService {
  static async getRemindersEnabled(): Promise<boolean> {
    const val = await AsyncStorage.getItem(StorageKeys.REMINDERS_ENABLED);
    return val !== 'false';
  }

  static async setRemindersEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(StorageKeys.REMINDERS_ENABLED, enabled ? 'true' : 'false');
  }

  static async getAdhanSoundEnabled(): Promise<boolean> {
    const val = await AsyncStorage.getItem(StorageKeys.ADHAN_SOUND_ENABLED);
    return val !== 'false';
  }

  static async setAdhanSoundEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(StorageKeys.ADHAN_SOUND_ENABLED, enabled ? 'true' : 'false');
  }

  static async getPrayerAlertToggles(): Promise<PrayerAlertToggles> {
    const val = await AsyncStorage.getItem(StorageKeys.PRAYER_ALERTS);
    if (val) {
      try {
        return JSON.parse(val);
      } catch (_) { }
    }
    return {
      Fajr: true,
      Sunrise: false,
      Dhuhr: true,
      Asr: true,
      Maghrib: true,
      Isha: true,
    };
  }

  static async setPrayerAlertToggles(toggles: PrayerAlertToggles): Promise<void> {
    await AsyncStorage.setItem(StorageKeys.PRAYER_ALERTS, JSON.stringify(toggles));
  }

  static async getLocation(): Promise<UserLocation> {
    const city = (await AsyncStorage.getItem(StorageKeys.CITY)) || 'Karachi';
    const country = (await AsyncStorage.getItem(StorageKeys.COUNTRY)) || 'Pakistan';
    const useGps = (await AsyncStorage.getItem(StorageKeys.USE_GPS)) === 'true';
    const latVal = await AsyncStorage.getItem(StorageKeys.LATITUDE);
    const lngVal = await AsyncStorage.getItem(StorageKeys.LONGITUDE);

    let lat = latVal ? parseFloat(latVal) : 24.8607;
    let lng = lngVal ? parseFloat(lngVal) : 67.0011;

    return { city, country, useGps, lat, lng };
  }

  static async getCalculationSettings(): Promise<{ methodId: number; schoolId: number }> {
    const methodVal = await AsyncStorage.getItem(StorageKeys.METHOD);
    const schoolVal = await AsyncStorage.getItem(StorageKeys.SCHOOL);
    return {
      methodId: methodVal ? parseInt(methodVal, 10) : 1,
      schoolId: schoolVal ? parseInt(schoolVal, 10) : 1,
    };
  }

  static async getLastScheduledMetadata(): Promise<{ lastDate: string | null; lastOffset: string | null }> {
    const lastDate = await AsyncStorage.getItem(StorageKeys.LAST_SCHEDULED_DATE);
    const lastOffset = await AsyncStorage.getItem(StorageKeys.LAST_TIMEZONE_OFFSET);
    return { lastDate, lastOffset };
  }

  static async setLastScheduledMetadata(dateStr: string, offsetStr: string): Promise<void> {
    await AsyncStorage.setItem(StorageKeys.LAST_SCHEDULED_DATE, dateStr);
    await AsyncStorage.setItem(StorageKeys.LAST_TIMEZONE_OFFSET, offsetStr);
  }

  static async appendDeliveryLog(record: {
    id: string;
    prayerName: string;
    scheduledTimeStr: string;
    scheduledTimestamp: number;
    actualReceivedTimeStr: string;
    actualReceivedTimestamp: number;
    diffSeconds: number;
    state: string;
  }): Promise<void> {
    try {
      const val = await AsyncStorage.getItem('notification_delivery_logs');
      let logs = val ? JSON.parse(val) : [];
      if (!Array.isArray(logs)) logs = [];
      logs.unshift(record);
      if (logs.length > 50) logs = logs.slice(0, 50);
      await AsyncStorage.setItem('notification_delivery_logs', JSON.stringify(logs));
    } catch (_) { }
  }

  static async getDeliveryLogs(): Promise<any[]> {
    try {
      const val = await AsyncStorage.getItem('notification_delivery_logs');
      return val ? JSON.parse(val) : [];
    } catch (_) {
      return [];
    }
  }
}
