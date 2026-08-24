/**
 * 원본: ui/weeklyreset/WeeklyResetPrefs.kt
 * "이번 주 Weekly Reset을 이미 처리했는지"를 기록하는 최소 저장소.
 * 저장값: 마지막으로 "All tasks assigned" 완료 화면까지 도달한 주의
 * 월요일 날짜('YYYY-MM-DD'). 앱 재실행 시 leftover Task 유무와 별개로,
 * 이미 이번 주를 처리했다면 Weekly Reset을 다시 띄우지 않는다.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_LAST_PROCESSED_WEEK = 'weekly_reset_prefs.last_processed_week_start';

export async function isProcessed(weekStart: string): Promise<boolean> {
  const saved = await AsyncStorage.getItem(KEY_LAST_PROCESSED_WEEK);
  return saved === weekStart;
}

export async function markProcessed(weekStart: string): Promise<void> {
  await AsyncStorage.setItem(KEY_LAST_PROCESSED_WEEK, weekStart);
}
