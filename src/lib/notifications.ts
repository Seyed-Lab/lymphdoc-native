import * as Notifications from "expo-notifications";

/**
 * Native reminder upgrade over the web version:
 * the web app could only show a Notification while the tab was open \u2014
 * here we schedule a real daily reminder at 20:30 that fires even when the app is closed.
 */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const EVENING_ID = "lymphdoc-evening-checkin";

export async function syncEveningReminder(enabled: boolean): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(EVENING_ID).catch(() => {});
    if (!enabled) return;
    const perm = await Notifications.getPermissionsAsync();
    let granted = perm.granted;
    if (!granted) {
      const req = await Notifications.requestPermissionsAsync();
      granted = req.granted;
    }
    if (!granted) return;
    await Notifications.scheduleNotificationAsync({
      identifier: EVENING_ID,
      content: {
        title: "Droppi \ud83d\udca7",
        body: "Nimm dir 10 Sekunden f\u00fcr deinen Check-in \u2014 es hilft deiner Verlaufs-Story.",
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 20, minute: 30 },
    });
  } catch {
    // notifications unavailable (e.g. simulator without permissions) \u2014 fail silently
  }
}
