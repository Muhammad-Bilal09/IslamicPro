import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules, Platform } from "react-native";
import { apiClient } from "./api";

const { InstallReferrerModule } = NativeModules;
const STORAGE_KEY_PROCESSED = "trackier_install_processed";

/**
 * Robustly parses a URL or query string to extract a given parameter value.
 * Example referrer string: "utm_source=test&click_id=TEST123&utm_medium=social"
 * Handles any parameter ordering and URL-encoded values.
 */
export function extractQueryParam(
  queryString: string | null | undefined,
  paramName: string
): string | null {
  if (!queryString || typeof queryString !== "string") return null;

  try {
    let cleanQuery = queryString.trim();
    if (cleanQuery.startsWith("?")) {
      cleanQuery = cleanQuery.substring(1);
    }

    const pairs = cleanQuery.split("&");
    for (const pair of pairs) {
      if (!pair) continue;
      const [rawKey, rawValue] = pair.split("=");
      if (rawKey) {
        const key = decodeURIComponent(rawKey.trim()).toLowerCase();
        if (key === paramName.toLowerCase()) {
          const value = rawValue !== undefined ? decodeURIComponent(rawValue.trim()) : "";
          return value.length > 0 ? value : null;
        }
      }
    }
  } catch (err) {
    console.warn("[Trackier] Error parsing query string:", err);
  }
  return null;
}

export class TrackierManager {
  /**
   * Reads Google Play Install Referrer on first app launch, extracts click_id,
   * and sends it to IslamicPro-server backend.
   * Ensures install referrer is processed ONLY ONCE per installation.
   */
  static async checkAndProcessInstallReferrer(): Promise<void> {
    try {
      // 1. Check if install referrer has already been processed locally
      const alreadyProcessed = await AsyncStorage.getItem(STORAGE_KEY_PROCESSED);
      if (alreadyProcessed === "true") {
        return;
      }

      console.log("[Trackier] Reading install referrer...");

      let referrerString: string | null = null;

      if (Platform.OS === "android" && InstallReferrerModule?.getInstallReferrer) {
        try {
          referrerString = await InstallReferrerModule.getInstallReferrer();
        } catch (e: any) {
          console.warn("[Trackier] Failed to read install referrer from native module:", e?.message || e);
        }
      } else {
        console.log("[Trackier] Install referrer native module unavailable or non-Android platform.");
      }

      console.log(`[Trackier] Referrer received: ${referrerString || "(none)"}`);

      if (!referrerString) {
        console.log("[Trackier] No click_id found");
        await AsyncStorage.setItem(STORAGE_KEY_PROCESSED, "true");
        return;
      }

      // 2. Extract click_id using query parameter parsing
      const clickId = extractQueryParam(referrerString, "click_id");
      if (!clickId) {
        console.log("[Trackier] No click_id found");
        await AsyncStorage.setItem(STORAGE_KEY_PROCESSED, "true");
        return;
      }

      console.log(`[Trackier] click_id extracted: ${clickId}`);
      console.log("[Trackier] Sending click_id to backend");

      // 3. Send click_id to backend API with retries
      const success = await TrackierManager.sendClickIdToBackend(clickId);

      if (success) {
        console.log("[Trackier] Backend response received");
        await AsyncStorage.setItem(STORAGE_KEY_PROCESSED, "true");
      } else {
        console.warn("[Trackier] Backend request failed. Will retry on next startup.");
      }
    } catch (error: any) {
      console.error("[Trackier] Error in install referrer flow:", error?.message || error);
    }
  }

  /**
   * Helper method to post click_id to IslamicPro-server backend with timeout & retry logic.
   */
  private static async sendClickIdToBackend(clickId: string, retries = 2): Promise<boolean> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await apiClient.post(
          "/trackier/install",
          { click_id: clickId },
          { timeout: 10000 }
        );

        if (response.data && response.data.success) {
          return true;
        }
      } catch (err: any) {
        console.warn(`[Trackier] Backend POST attempt ${attempt}/${retries} failed:`, err?.message || err);
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }
    return false;
  }
}
