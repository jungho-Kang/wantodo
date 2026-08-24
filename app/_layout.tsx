import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getDb } from '../src/db/client';
import { useSettingsStore } from '../src/store/settingsStore';
import { syncReminderNotifications } from '../src/lib/notifications';

export default function RootLayout() {
  const weeklyReminderEnabled = useSettingsStore((s) => s.weeklyReminderEnabled);
  const eveningReminderEnabled = useSettingsStore((s) => s.eveningReminderEnabled);

  useEffect(() => {
    // Room(AppDatabase.kt) 대응: 앱 시작 시 SQLite 테이블을 보장한다.
    getDb();
  }, []);

  // Settings > General 토글이 바뀔 때마다(+ 영속화 복원 후 최초 1회) 실제
  // 예약된 알림과 동기화한다.
  useEffect(() => {
    syncReminderNotifications({ weeklyReminderEnabled, eveningReminderEnabled });
  }, [weeklyReminderEnabled, eveningReminderEnabled]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="focus" options={{ presentation: 'fullScreenModal', headerShown: false }} />
          <Stack.Screen name="statistics" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="weekly-reset" options={{ presentation: 'fullScreenModal', headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
