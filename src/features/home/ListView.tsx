/**
 * 원본: ui/home/ListView.kt (Master Spec 1번 구조 설명 기준, 5.2)
 *
 * - Week Navigation 없음
 * - 날짜별 Section Header, Task 없는 날짜는 헤더만 출력
 * - Circle 체크박스 + Drag Handle (TodoCardVariant.LIST 로 위임)
 *
 * List View 에는 Week Navigation 사이드바가 없기 때문에, Long-press+
 * Drag(5.2) 중에는 날짜 Section Header 자체를 DropTarget 'day' 로 등록해
 * 드롭 타겟 역할을 하게 한다. Backlog pill 은 Header 영역(공용)에서
 * 그대로 동작한다.
 *
 * 원본은 List View 자체 스크롤(LazyColumn)이지만, RN은 드래그 중 좌표가
 * 스크롤로 틀어지는 것을 막기 위해 드래그 중 스크롤을 잠근다 (원본에는
 * 없던 RN 쪽 안전장치 - MIGRATION.md 8번 섹션 참고).
 */
import { useEffect, useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { format } from 'date-fns';
import { useDragStore } from '../../store/dragStore';
import { fromISODate } from '../../lib/dates';
import type { Task } from '../../db/schema';
import { AccentTeal } from '../../theme/colors';
import { TodoCard } from './TodoCard';

export function ListView({
  weekDates,
  tasksByDate,
  onToggleComplete,
  onSwipedToNextDay,
  onSwipedLeft,
  onDroppedOnBacklog,
  onDroppedOnDate,
}: {
  weekDates: string[];
  tasksByDate: Record<string, Task[]>;
  onToggleComplete: (task: Task) => void;
  onSwipedToNextDay: (task: Task) => void;
  onSwipedLeft: (task: Task) => void;
  onDroppedOnBacklog: (task: Task) => void;
  onDroppedOnDate: (task: Task, date: string) => void;
}) {
  const isDragging = useDragStore((s) => s.isDragging);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 4 }}
      scrollEnabled={!isDragging}
    >
      {weekDates.map((date) => {
        const tasks = tasksByDate[date] ?? [];
        return (
          <View key={date}>
            <DateSectionHeader date={date} />
            <View style={{ gap: 4 }}>
              {tasks.map((task) => (
                <TodoCard
                  key={task.id}
                  task={task}
                  variant="LIST"
                  onToggleComplete={() => onToggleComplete(task)}
                  onSwipedToNextDay={() => onSwipedToNextDay(task)}
                  onSwipedLeft={() => onSwipedLeft(task)}
                  onDroppedOnBacklog={() => onDroppedOnBacklog(task)}
                  onDroppedOnDate={(d) => onDroppedOnDate(task, d)}
                />
              ))}
            </View>
            <View style={{ height: 8 }} />
          </View>
        );
      })}
    </ScrollView>
  );
}

function DateSectionHeader({ date }: { date: string }) {
  const viewRef = useRef<View>(null);
  const isDragging = useDragStore((s) => s.isDragging);
  const registerTarget = useDragStore((s) => s.registerTarget);
  const clearTarget = useDragStore((s) => s.clearTarget);
  const hoveredTarget = useDragStore((s) => s.hoveredTarget);
  const target = { type: 'day' as const, date };
  const isHovered = isDragging && hoveredTarget?.type === 'day' && hoveredTarget.date === date;

  const measure = () => {
    if (!isDragging) return;
    viewRef.current?.measureInWindow((x, y, width, height) => {
      registerTarget(target, { x, y, width, height });
    });
  };

  useEffect(() => {
    if (!isDragging) clearTarget(target);
    return () => clearTarget(target);
  }, [isDragging, date]);

  return (
    <View
      ref={viewRef}
      onLayout={measure}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderRadius: 8,
        borderWidth: isHovered ? 2 : 0,
        borderColor: AccentTeal,
        paddingVertical: 8,
      }}
    >
      <Text style={{ fontSize: 14 }}>{format(fromISODate(date), 'EEEE, d. MMMM')}</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: '#eee' }} />
    </View>
  );
}
