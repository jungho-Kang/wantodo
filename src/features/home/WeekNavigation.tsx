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
 * Week Navigation 진행도("1/3") 표시는 원본도 미연결 상태(TODO)라
 * RN도 동일하게 미연결로 둔다.
 */
import { useEffect, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { format, getDay } from 'date-fns';
import { useDragStore } from '../../store/dragStore';
import { fromISODate } from '../../lib/dates';
import { dayColorsBySundayIndex } from '../../theme/dayColors';
import { AccentTeal } from '../../theme/colors';

export function WeekNavigation({
  weekDates,
  selectedDate,
  showWeekend,
  onDaySelected,
}: {
  weekDates: string[];
  selectedDate: string;
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
          <ExpandedDayRow key={date} date={date} />
        ) : (
          <CompactDayTab
            key={date}
            date={date}
            isActive={date === selectedDate}
            onPress={() => onDaySelected(date)}
          />
        )
      )}
    </Animated.View>
  );
}

function CompactDayTab({ date, isActive, onPress }: { date: string; isActive: boolean; onPress: () => void }) {
  const d = fromISODate(date);
  const dow = getDay(d);
  const bgColor = isActive ? '#fff' : dayColorsBySundayIndex[dow];

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
        paddingVertical: 8,
      }}
    >
      {isActive && <Text style={{ fontSize: 12 }}>•</Text>}
      <Text style={{ fontSize: 14, textAlign: 'center' }}>{format(d, 'EEE').toUpperCase()}</Text>
    </Pressable>
  );
}

function ExpandedDayRow({ date }: { date: string }) {
  const viewRef = useRef<View>(null);
  const registerTarget = useDragStore((s) => s.registerTarget);
  const clearTarget = useDragStore((s) => s.clearTarget);
  const hoveredTarget = useDragStore((s) => s.hoveredTarget);
  const target = { type: 'day' as const, date };
  const isHovered = hoveredTarget?.type === 'day' && hoveredTarget.date === date;

  const d = fromISODate(date);
  const dow = getDay(d);
  const bgColor = dayColorsBySundayIndex[dow];

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
        borderColor: AccentTeal,
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}
    >
      <Text style={{ fontSize: 14 }}>{format(d, 'EEEE')}</Text>
    </View>
  );
}
