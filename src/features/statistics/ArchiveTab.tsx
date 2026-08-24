/**
 * 원본: ui/statistics/StatisticsBottomSheet.kt 의 private ArchiveTab (Master Spec 9.3)
 * 과거 Task 읽기 전용. Accent Color 체크박스.
 *
 * 날짜 헤더는 원본이 LocalDate.toString()('YYYY-MM-DD')을 그대로 찍는
 * 코드라서, 보기 좋게 바꾸지 않고 그 표기를 그대로 승계한다.
 */
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '../../components/Text';
import { useFocusEffect } from 'expo-router';
import * as taskQueries from '../../db/taskQueries';
import type { Task } from '../../db/schema';
import { toISODate } from '../../lib/dates';
import { startOfWeek } from 'date-fns';
import { useActivePalette } from '../../theme/useActivePalette';
import { useThemeColors } from '../../theme/useThemeColors';

export function ArchiveTab() {
  const { accentColor } = useActivePalette();
  const theme = useThemeColors();
  const [pastTasks, setPastTasks] = useState<Task[]>([]);

  const weekStart = useMemo(() => toISODate(startOfWeek(new Date(), { weekStartsOn: 1 })), []);

  const load = useCallback(async () => {
    const tasks = await taskQueries.getPastTasks(weekStart);
    setPastTasks(tasks);
  }, [weekStart]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const grouped = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const t of pastTasks) {
      if (!t.date) continue;
      (map[t.date] ??= []).push(t);
    }
    return Object.entries(map).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [pastTasks]);

  if (pastTasks.length === 0) {
    return (
      <View style={{ paddingVertical: 48, alignItems: 'center' }}>
        <Text style={{ fontSize: 14, color: theme.textSecondary }}>No past tasks</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 4 }}>
      {grouped.map(([date, tasks]) => (
        <View key={date}>
          <Text style={{ fontSize: 14, paddingVertical: 8 }}>
            {date}  ({tasks.filter((t) => t.isCompleted).length}/{tasks.length})
          </Text>
          {tasks.map((task) => (
            <View key={task.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4 }}>
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  backgroundColor: task.isCompleted ? accentColor : 'transparent',
                }}
              />
              <View style={{ width: 12 }} />
              <Text
                style={{
                  fontSize: 16,
                  textDecorationLine: task.isCompleted ? 'line-through' : 'none',
                }}
              >
                {task.title}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
