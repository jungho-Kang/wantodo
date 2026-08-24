/**
 * Settings > General 의 Weekly reminder / Evening reminder 토글을 실제
 * 로컬 알림 예약과 동기화한다.
 *
 * 원본 Kotlin 앱에도 이 알림 발동 로직 자체가 없어서(WorkManager/AlarmManager
 * 미구현), 정확한 발동 시각/문구는 원본에 근거가 없다 - 합리적인 기본값으로
 * 새로 설계함: Weekly reminder는 매주 월요일 오전 9시(한 주를 계획하는 시점),
 * Evening reminder는 매일 저녁 8시(하루를 정리하는 시점).
 *
 * ⚠️ Expo Go + Android 조합에서는 `expo-notifications`를 그냥 import하는
 * 순간 앱이 죽는다 - 우리가 로컬 알림만 쓰는 것과 무관하게, 그 패키지
 * 내부의 `DevicePushTokenAutoRegistration.fx.js`가 모듈 로드 시점(최상위
 * 스코프)에 무조건 `addPushTokenListener()`를 호출하고, 이게 내부적으로
 * "Android Push notifications ... removed from Expo Go with SDK 53"
 * 에러를 throw하도록 되어 있음(실기기 실측으로 확인, 실제 원본:
 * expo-notifications/build/warnOfExpoGoPushUsage.js). 그래서 이 조합에서는
 * `expo-notifications`를 아예 import하지 않고(동적 import로 지연) 조용히
 * 건너뛴다 - dev build/production build에서는 정상 동작한다.
 */
import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';

const WEEKLY_REMINDER_ID = 'weekly-reminder';
const EVENING_REMINDER_ID = 'evening-reminder';
const CHANNEL_ID = 'reminders';

const NOTIFICATIONS_UNAVAILABLE = Platform.OS === 'android' && isRunningInExpoGo();

let handlerConfigured = false;

async function loadNotifications() {
  const Notifications = await import('expo-notifications');
  if (!handlerConfigured) {
    handlerConfigured = true;
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  }
  return Notifications;
}

async function ensureChannel(Notifications: Awaited<ReturnType<typeof loadNotifications>>) {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

async function ensurePermission(Notifications: Awaited<ReturnType<typeof loadNotifications>>): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted';
}

export async function syncReminderNotifications(state: {
  weeklyReminderEnabled: boolean;
  eveningReminderEnabled: boolean;
}) {
  if (NOTIFICATIONS_UNAVAILABLE) return;

  const Notifications = await loadNotifications();

  await Promise.all([
    Notifications.cancelScheduledNotificationAsync(WEEKLY_REMINDER_ID).catch(() => {}),
    Notifications.cancelScheduledNotificationAsync(EVENING_REMINDER_ID).catch(() => {}),
  ]);

  if (!state.weeklyReminderEnabled && !state.eveningReminderEnabled) return;

  const granted = await ensurePermission(Notifications);
  if (!granted) return;
  await ensureChannel(Notifications);

  if (state.weeklyReminderEnabled) {
    await Notifications.scheduleNotificationAsync({
      identifier: WEEKLY_REMINDER_ID,
      content: {
        title: 'New week, new plan',
        body: "Open the app and plan out this week's tasks.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 2, // 1=Sunday, 2=Monday
        hour: 9,
        minute: 0,
        channelId: CHANNEL_ID,
      },
    });
  }

  if (state.eveningReminderEnabled) {
    await Notifications.scheduleNotificationAsync({
      identifier: EVENING_REMINDER_ID,
      content: {
        title: 'How did today go?',
        body: 'Check off what you finished and roll over the rest.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 20,
        minute: 0,
        channelId: CHANNEL_ID,
      },
    });
  }
}
