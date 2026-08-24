/**
 * 원본: ui/statistics/StatisticsBottomSheet.kt 의 private ActivityTab (Master Spec 9.2)
 * 20주치 멀티주 Heatmap + Overview 4지표 + 오늘 날짜 칸 테두리 강조.
 *
 * Heatmap이 보여줄 과거 주 수는 원본도 정확한 기간이 [UNKNOWN]이라, 실기기
 * 영상에서 여러 달치가 이어지는 것을 확인해 [ESTIMATED]로 20주 넉넉히 잡았다.
 */
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '../../components/Text';
import { useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { addDays, endOfWeek, startOfWeek, subWeeks } from 'date-fns';
import * as taskQueries from '../../db/taskQueries';
import type { Task } from '../../db/schema';
import { fromISODate, toISODate, todayISODate } from '../../lib/dates';
import { withAlpha } from '../../theme/colors';
import { useActivePalette } from '../../theme/useActivePalette';
import { useThemeColors } from '../../theme/useThemeColors';

const HEATMAP_WEEKS = 20;
const DAY_LABELS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

export function ActivityTab() {
  const { accentColor } = useActivePalette();
  const theme = useThemeColors();
  const [tasksInRange, setTasksInRange] = useState<Task[]>([]);

  const today = todayISODate();
  const rangeEnd = useMemo(() => toISODate(endOfWeek(fromISODate(today), { weekStartsOn: 1 })), [today]);
  const rangeStart = useMemo(
    () => toISODate(startOfWeek(subWeeks(fromISODate(rangeEnd), HEATMAP_WEEKS - 1), { weekStartsOn: 1 })),
    [rangeEnd]
  );

  const load = useCallback(async () => {
    const tasks = await taskQueries.getTasksInRange(rangeStart, rangeEnd);
    setTasksInRange(tasks);
  }, [rangeStart, rangeEnd]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    for (const t of tasksInRange) {
      if (!t.date) continue;
      (grouped[t.date] ??= []).push(t);
    }
    return grouped;
  }, [tasksInRange]);

  const created = tasksInRange.length;
  const completed = tasksInRange.filter((t) => t.isCompleted).length;
  const open = tasksInRange.filter((t) => !t.isCompleted && !!t.date && t.date >= today).length;
  const expired = tasksInRange.filter((t) => !t.isCompleted && !!t.date && t.date < today).length;

  const maxCount = Math.max(1, ...Object.values(tasksByDate).map((arr) => arr.length));

  const weekColumns = useMemo(() => {
    const columns: string[][] = [];
    let monday = fromISODate(rangeStart);
    const end = fromISODate(rangeEnd);
    while (monday.getTime() <= end.getTime()) {
      columns.push(Array.from({ length: 7 }, (_, i) => toISODate(addDays(monday, i))));
      monday = addDays(monday, 7);
    }
    return columns;
  }, [rangeStart, rangeEnd]);

  return (
    <ScrollView contentContainerStyle={{ paddingVertical: 16 }}>
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 6 }}>
        <View style={{ alignItems: 'flex-end', gap: 3 }}>
          {DAY_LABELS.map((label) => (
            <Text key={label} style={{ fontSize: 10, height: 14, color: theme.textSecondary }}>
              {label}
            </Text>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 3 }}>
            {weekColumns.map((week, wi) => (
              <View key={wi} style={{ gap: 3 }}>
                {week.map((date) => {
                  const count = tasksByDate[date]?.length ?? 0;
                  const intensity = count / maxCount;
                  const isToday = date === today;
                  return (
                    <View
                      key={date}
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 3,
                        backgroundColor:
                          count === 0 ? theme.track : withAlpha(accentColor, 0.25 + intensity * 0.6),
                        borderWidth: isToday ? 1 : 0,
                        borderColor: accentColor,
                      }}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={{ height: 8 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 10, color: theme.textSecondary }}>Less</Text>
        <View style={{ width: 4 }} />
        {[0.15, 0.35, 0.55, 0.85].map((alpha) => (
          <View
            key={alpha}
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              backgroundColor: withAlpha(accentColor, alpha),
              marginHorizontal: 2,
            }}
          />
        ))}
        <View style={{ width: 4 }} />
        <Text style={{ fontSize: 10, color: theme.textSecondary }}>More</Text>
      </View>

      <View style={{ height: 24 }} />

      <View style={{ paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 12, color: theme.textSecondary }}>OVERVIEW</Text>
        <View style={{ height: 8 }} />
        <View style={{ backgroundColor: theme.surface, borderRadius: 16, paddingHorizontal: 16 }}>
          <StatRow icon="add-circle" label="Created" value={created} />
          <Divider />
          <StatRow icon="check-circle" label="Completed" value={completed} />
          <Divider />
          <StatRow icon="radio-button-unchecked" label="Open" value={open} />
          <Divider />
          <StatRow icon="access-time" label="Expired" value={expired} />
        </View>
      </View>
    </ScrollView>
  );
}

function StatRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  value: number;
}) {
  const theme = useThemeColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 }}>
      <MaterialIcons name={icon} size={20} color={theme.textSecondary} />
      <Text style={{ flex: 1, fontSize: 16 }}>{label}</Text>
      <Text style={{ fontSize: 16 }}>{value}</Text>
    </View>
  );
}

function Divider() {
  const theme = useThemeColors();
  return <View style={{ height: 1, backgroundColor: theme.divider }} />;
}
