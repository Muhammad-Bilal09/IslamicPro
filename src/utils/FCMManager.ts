import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import apiClient from "./api";
import { StorageService } from "./StorageService";

const OS = Platform.OS as string;
const DELIVERED_STORAGE_KEY = "delivered_prayer_notifications_dedup";

export class FCMManager {
  private static registrationPromise: Promise<string | null> | null = null;
  private static lastRegisteredToken: string | null = null;

  /**
   * Generates FCM / Device Push Token and registers it with the Node.js backend server.
   */
  static async registerFCMToken(userId?: string): Promise<string | null> {
    if (OS === "web") return null;
    if (this.registrationPromise) return this.registrationPromise;

    this.registrationPromise = this.registerFCMTokenInternal(userId);
    try {
      return await this.registrationPromise;
    } finally {
      this.registrationPromise = null;
    }
  }

  private static async registerFCMTokenInternal(
    userId?: string,
  ): Promise<string | null> {
    try {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

      if (status !== "granted") {
        console.log("[FCMManager] Push notification permission denied.");
        return null;
      }

      // Fetch native FCM / APNs device token
      let tokenData: Notifications.DevicePushToken | null = null;
      try {
        tokenData = await Notifications.getDevicePushTokenAsync();
      } catch (e) {
        console.warn(
          "[FCMManager] getDevicePushTokenAsync notice, fallback to expo push token:",
          e,
        );
      }

      const fcmToken =
        tokenData?.data || (await Notifications.getExpoPushTokenAsync()).data;
      if (!fcmToken) {
        console.warn("[FCMManager] Could not retrieve device push token.");
        return null;
      }

      if (fcmToken === this.lastRegisteredToken) {
        return fcmToken;
      }

      console.log("[FCMManager] Device FCM Token generated:", fcmToken);

      const location = await StorageService.getLocation();
      const timezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Karachi";

      const payload = {
        userId: userId || "guest_user",
        fcmToken,
        platform: OS,
        latitude: location.lat ?? 24.8607,
        longitude: location.lng ?? 67.0011,
        timezone,
      };

      // Register with backend server endpoint
      try {
        await apiClient.post("/fcm/register", payload);
        console.log(
          "[FCMManager] Successfully registered FCM token with backend server!",
        );
      } catch (serverErr: any) {
        console.warn(
          "[FCMManager] Backend FCM registration notice:",
          serverErr?.message,
        );
      }

      await AsyncStorage.setItem("cached_fcm_token", fcmToken);
      this.lastRegisteredToken = fcmToken;
      return fcmToken;
    } catch (error) {
      console.error("[FCMManager] Error registering FCM token:", error);
      return null;
    }
  }

  /**
   * Listens for push token updates and syncs with backend server.
   */
  static setupTokenRefreshListener(): () => void {
    if (OS === "web") return () => {};

    const subscription = Notifications.addPushTokenListener(
      async (tokenObj) => {
        console.log("[FCMManager] FCM Token refreshed:", tokenObj.data);
        if (tokenObj.data !== this.lastRegisteredToken) {
          await this.registerFCMToken();
        }
      },
    );

    return () => subscription.remove();
  }

  /**
   * Marks a prayer notification ID as delivered locally (for deduplication).
   * Identifier format: prayer-fajr-2026-09-04
   */
  static async markNotificationDeliveredLocally(
    identifier: string,
  ): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(DELIVERED_STORAGE_KEY);
      const list: Record<string, number> = stored ? JSON.parse(stored) : {};

      list[identifier] = Date.now();

      // Clean up entries older than 48 hours to prevent bloat
      const cutoff = Date.now() - 48 * 60 * 60 * 1000;
      Object.keys(list).forEach((key) => {
        if (list[key] < cutoff) {
          delete list[key];
        }
      });

      await AsyncStorage.setItem(DELIVERED_STORAGE_KEY, JSON.stringify(list));
      console.log(`[FCM Dedup] Marked ${identifier} as delivered locally.`);
    } catch (err) {
      console.error("[FCM Dedup] Error marking notification delivered:", err);
    }
  }

  /**
   * Checks if a prayer notification ID was already delivered locally for this day.
   */
  static async isNotificationDeliveredLocally(
    identifier: string,
  ): Promise<boolean> {
    try {
      const stored = await AsyncStorage.getItem(DELIVERED_STORAGE_KEY);
      if (!stored) return false;
      const list: Record<string, number> = JSON.parse(stored);

      const timestamp = list[identifier];
      if (!timestamp) return false;

      // If delivered within the last 24 hours for the same day, count as already delivered
      const isFresh = Date.now() - timestamp < 24 * 60 * 60 * 1000;
      return isFresh;
    } catch (err) {
      console.error(
        "[FCM Dedup] Error checking notification delivered status:",
        err,
      );
      return false;
    }
  }

  /**
   * Handles incoming FCM backup push notification.
   * Drops silently if local alarm already delivered the alert.
   */
  static async handleIncomingFCMPush(
    notification: Notifications.Notification,
  ): Promise<boolean> {
    const data: Record<string, any> = notification.request.content.data || {};
    const prayerNameStr =
      typeof data.prayerName === "string" ? data.prayerName : "prayer";
    const rawIdentifier = data.identifier || data.prayerId;
    const now = new Date();
    const localDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const identifier: string =
      typeof rawIdentifier === "string"
        ? rawIdentifier
        : `prayer-${prayerNameStr.toLowerCase()}-${localDateStr}`;

    const alreadyDelivered =
      await this.isNotificationDeliveredLocally(identifier);

    if (alreadyDelivered) {
      console.log(
        `[FCM Dedup] Suppressing duplicate FCM push for ${identifier} (already delivered locally).`,
      );
      return false; // Suppress
    }

    console.log(
      `[FCM Backup] Local alarm missed for ${identifier}! Presenting FCM backup push notification with Adhan.`,
    );
    await this.markNotificationDeliveredLocally(identifier);
    return true; // Display notification
  }
}
