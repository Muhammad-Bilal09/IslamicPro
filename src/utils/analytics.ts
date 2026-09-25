import {
  getAnalytics,
  logEvent,
  logScreenView,
  setUserId,
  setUserProperties,
  setAnalyticsCollectionEnabled,
} from "@react-native-firebase/analytics";
import * as Linking from "expo-linking";

/**
 * Utility helper for Google Firebase Analytics tracking.
 * Uses modular Firebase Analytics SDK (v21+).
 * Gracefully handles calls and logs errors to prevent app crashes if native module is unavailable.
 */
export const Analytics = {
  /**
   * Log a custom event to Firebase Analytics.
   * @param eventName Name of the event (alphanumeric and underscores)
   * @param params Optional key-value parameters
   */
  async logEvent(eventName: string, params?: Record<string, any>) {
    try {
      const analyticsInstance = getAnalytics();
      await logEvent(analyticsInstance, eventName as any, params);
      console.log(`[Analytics] Event logged: ${eventName}`, params || "");
    } catch (error) {
      console.warn(`[Analytics] Failed to log event ${eventName}:`, error);
    }
  },

  /**
   * Log a screen view event to Firebase Analytics.
   * @param screenName Human-readable screen name
   * @param screenClass Optional screen class name
   */
  async logScreenView(screenName: string, screenClass?: string) {
    try {
      const analyticsInstance = getAnalytics();
      await logScreenView(analyticsInstance, {
        screen_name: screenName,
        screen_class: screenClass || screenName,
      });
      console.log(`[Analytics] Screen view logged: ${screenName}`);
    } catch (error) {
      console.warn(`[Analytics] Failed to log screen view ${screenName}:`, error);
    }
  },

  /**
   * Set a unique User ID for tracking user sessions.
   * @param userId Unique user identifier or null to clear
   */
  async setUserId(userId: string | null) {
    try {
      const analyticsInstance = getAnalytics();
      await setUserId(analyticsInstance, userId);
      console.log(`[Analytics] User ID set: ${userId}`);
    } catch (error) {
      console.warn("[Analytics] Failed to set user ID:", error);
    }
  },

  /**
   * Set user properties to segment users in Firebase Analytics.
   * @param properties Key-value map of user properties
   */
  async setUserProperties(properties: Record<string, string | null>) {
    try {
      const analyticsInstance = getAnalytics();
      await setUserProperties(analyticsInstance, properties);
      console.log("[Analytics] User properties set:", properties);
    } catch (error) {
      console.warn("[Analytics] Failed to set user properties:", error);
    }
  },

  /**
   * Enable or disable automatic analytics data collection.
   * @param enabled boolean
   */
  async setAnalyticsCollectionEnabled(enabled: boolean) {
    try {
      const analyticsInstance = getAnalytics();
      await setAnalyticsCollectionEnabled(analyticsInstance, enabled);
      console.log(`[Analytics] Collection enabled set to: ${enabled}`);
    } catch (error) {
      console.warn("[Analytics] Failed to set collection enabled state:", error);
    }
  },

  /**
   * Parse deep link URLs for UTM parameters and log them to Firebase Analytics.
   * @param url Deep link URL string
   */
  async trackUtmFromUrl(url: string | null) {
    if (!url) return;

    try {
      const parsed = Linking.parse(url);
      const queryParams = parsed.queryParams || {};

      const utmSource = queryParams.utm_source as string | undefined;
      const utmMedium = queryParams.utm_medium as string | undefined;
      const utmCampaign = queryParams.utm_campaign as string | undefined;
      const utmContent = queryParams.utm_content as string | undefined;
      const utmTerm = queryParams.utm_term as string | undefined;

      if (utmSource || utmMedium || utmCampaign) {
        const analyticsInstance = getAnalytics();
        await logEvent(analyticsInstance, "campaign_details", {
          source: utmSource || "unknown",
          medium: utmMedium || "unknown",
          campaign: utmCampaign || "unknown",
          content: utmContent,
          term: utmTerm,
        });
        console.log(`[Analytics] UTM Campaign logged from URL (${url}):`, {
          utmSource,
          utmMedium,
          utmCampaign,
          utmContent,
          utmTerm,
        });
      }
    } catch (error) {
      console.warn("[Analytics] Failed to parse and track UTM from URL:", error);
    }
  },
};
