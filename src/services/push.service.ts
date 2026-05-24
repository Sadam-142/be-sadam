import webpush from "web-push";
import { env } from "../config/env";
import { logger } from "../utils/logger";

if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    env.VAPID_SUBJECT || "mailto:admin@example.com",
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
  );
} else {
  logger.warn("VAPID keys not configured, Web Push will fail.");
}

export const pushService = {
  /**
   * Mengirim notifikasi push ke sebuah perangkat
   */
  async sendNotification(subscriptionJson: string, payload: { title: string; body: string; url?: string }) {
    if (!subscriptionJson) return;
    
    try {
      const subscription = JSON.parse(subscriptionJson);
      await webpush.sendNotification(subscription, JSON.stringify(payload));
      logger.info(`Push notification sent: ${payload.title}`);
    } catch (error: any) {
      if (error.statusCode === 410 || error.statusCode === 404) {
        // The subscription has expired or is no longer valid
        logger.info("Subscription expired or invalid.");
        // We could ideally delete the device_token from db here
      } else {
        logger.error("Failed to send push notification", error);
      }
    }
  },

  /**
   * Mengirim notifikasi ke banyak perangkat
   */
  async sendMulticast(subscriptionJsons: string[], payload: { title: string; body: string; url?: string }) {
    const promises = subscriptionJsons
      .filter((json) => json && json.trim() !== "")
      .map((json) => this.sendNotification(json, payload));
    
    await Promise.allSettled(promises);
  }
};
