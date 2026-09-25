import * as Notifications from 'expo-notifications';
import 'expo-router/entry';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});

console.log('[index.js] Registered Expo Notifications handler.');

