/**
 * 원본: ui/home/WeekNavigation.kt (Master Spec 4.2, 5.2)
 *
 * - Inactive Day: 저채도 배경, 요일 약어(3글자)
 * - Active Day: surface 배경 + 점(•) 인디케이터
 * - showWeekend = false 이면 토/일 숨김 (Settings > Show Weekend)
 *
 * useDragStore().isDragging 인 동안에는 요일 풀네임 가로 텍스트로 확장된다
 * (Master Spec 5.2). 각 요일 행은 DropTarget 'day'로 등록되어 TodoCard 의
 * Long-press+Drag 종료 시 판정에 사용된다.
 *
 * Week Navigation 진행도("완료/전체") 표시 - 원본 zip(v1.5) 시점엔
 * emptyMap()으로 비어있었지만(TODO 미연결), 사용자 요청으로 실제 계산해서
 * 연결함 - 그 날짜에 배정된 Task 기준 완료/전체 개수 (app/index.tsx 참고).
 */
import { useEffect, useRef } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../components/Text';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { format, getDay } from 'date-fns';
import { useDragStore } from '../../store/dragStore';
import { fromISODate } from '../../lib/dates';
import { useActivePalette } from '../../theme/useActivePalette';
import { useThemeColors } from '../../theme/useThemeColors';
import { getContrastTextColor } from '../../theme/colors';

export type DayProgress = { completed: number; total: number };

export function WeekNavigation({
  weekDates,
  selectedDate,
  progressByDate,
  showWeekend,
  onDaySelected,
}: {
  weekDates: string[];
  selectedDate: string;
  progressByDate: Record<string, DayProgress>;
  showWeekend: boolean;
  onDaySelected: (date: string) => void;
}) {
  const isDragging = useDragStore((s) => s.isDragging);

  const visibleDates = showWeekend
    ? weekDates
    : weekDates.filter((d) => {
        const dow = getDay(fromISODate(d));
        return dow !== 0 && dow !== 6;
      });

  const widthStyle = useAnimatedStyle(() => ({
    width: withTiming(isDragging ? 140 : 56, { duration: 200 }),
  }));

  return (
    <Animated.View style={[{ height: '100%' }, widthStyle]}>
      {visibleDates.map((date) =>
        isDragging ? (
          <ExpandedDayRow key={date} date={date} progress={progressByDate[date]} />
        ) : (
          <CompactDayTab
            key={date}
            date={date}
            isActive={date === selectedDate}
            progress={progressByDate[date]}
            onPress={() => onDaySelected(date)}
          />
        )
      )}
    </Animated.View>
  );
}

function CompactDayTab({
  date,
  isActive,
  progress,
  onPress,
}: {
  date: string;
  isActive: boolean;
  progress?: DayProgress;
  onPress: () => void;
}) {
  const { dayColorsBySundayIndex } = useActivePalette();
  const colors = useThemeColors();
  const d = fromISODate(date);
  const dow = getDay(d);
  const bgColor = isActive ? colors.surface : dayColorsBySundayIndex[dow];
  const label = format(d, 'EEE');

  // 활성/비활성 모두 세로로 회전된 텍스트로 표시하고, 활성 요일은 배경색(surface)
  // + 점(•) 인디케이터 + 굵은 글씨로만 구분한다 (사용자 피드백: 선택 시 가로로
  // 펼쳐지던 이전 동작은 원하지 않음 - 항상 세로 회전 유지).
  const textColor = isActive ? colors.text : getContrastTextColor(bgColor);

  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        width: '100%',
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
        backgroundColor: bgColor,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        gap: 4,
      }}
    >
      {isActive && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: textColor }} />
          {!!progress && progress.total > 0 && (
            <Text style={{ fontSize: 9, color: textColor, opacity: 0.8 }}>
              {progress.completed}/{progress.total}
            </Text>
          )}
        </View>
      )}
      <Text
        style={{ fontSize: 13, fontWeight: isActive ? 'bold' : '600', color: textColor, transform: [{ rotate: '-90deg' }] }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ExpandedDayRow({ date, progress }: { date: string; progress?: DayProgress }) {
  const viewRef = useRef<View>(null);
  const registerTarget = useDragStore((s) => s.registerTarget);
  const clearTarget = useDragStore((s) => s.clearTarget);
  const hoveredTarget = useDragStore((s) => s.hoveredTarget);
  const target = { type: 'day' as const, date };
  const isHovered = hoveredTarget?.type === 'day' && hoveredTarget.date === date;
  const { dayColorsBySundayIndex, accentColor } = useActivePalette();

  const d = fromISODate(date);
  const dow = getDay(d);
  const bgColor = dayColorsBySundayIndex[dow];
  const textColor = getContrastTextColor(bgColor);

  const measure = () => {
    viewRef.current?.measureInWindow((x, y, width, height) => {
      registerTarget(target, { x, y, width, height });
    });
  };

  useEffect(() => {
    return () => clearTarget(target);
  }, [date]);

  return (
    <View
      ref={viewRef}
      onLayout={measure}
      style={{
        flex: 1,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
        backgroundColor: bgColor,
        borderWidth: isHovered ? 2 : 0,
        borderColor: accentColor,
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}
    >
      <Text style={{ fontSize: 14, color: textColor }}>{format(d, 'EEEE')}</Text>
      {!!progress && progress.total > 0 && (
        <Text style={{ fontSize: 12, opacity: 0.7, color: textColor }}>
          {progress.completed}/{progress.total}
        </Text>
      )}
    </View>
  );
}
