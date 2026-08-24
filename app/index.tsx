/**
 * 원본: ui/home/HomeScreen.kt (Master Spec 4, 5, 6번)
 *
 * 구현 범위:
 * - Week View / List View 전환 (2번 View Toggle)
 * - Right Swipe -> 다음 날짜 이동 (5.1)
 * - Left Swipe -> Task Action Bottom Sheet (5.3, 6번)
 * - Long-press+Drag -> Backlog 또는 임의 요일로 이동 (5.2)
 * - Note 상세/편집, 제목 편집 Bottom Sheet
 * - Focus Session(7)/Settings(10)/Statistics(9) 진입점 -> expo-router로 이동
 *   (원본은 로컬 boolean state로 전체화면 오버레이를 띄웠지만, RN에서는
 *   _layout.tsx에 이미 등록된 모달 라우트로 대체 — 기능은 동일)
 * - Weekly Reset(8): 앱 진입 시 지난 주 미완료 Task 존재 여부를 1회 확인해
 *   있으면 /weekly-reset 으로 이동
 * - Create calendar event: expo-calendar/legacy의 createEventInCalendarAsync로
 *   OS 캘린더 앱의 "일정 추가" 화면을 띄움 (원본 util/CalendarEventHelper.kt의
 *   Intent.ACTION_INSERT와 동일한 방식 - 종일 이벤트, 앱 자체 캘린더 권한 불필요)
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { addDays } from 'date-fns';
import { createEventInCalendarAsync } from 'expo-calendar/legacy';

import { useTaskStore } from '../src/store/taskStore';
import { useSettingsStore } from '../src/store/settingsStore';
import * as taskQueries from '../src/db/taskQueries';
import * as weeklyResetPrefs from '../src/db/weeklyResetPrefs';
import type { Task } from '../src/db/schema';
import { fromISODate } from '../src/lib/dates';

import { useThemeColors } from '../src/theme/useThemeColors';
import { HeaderSection } from '../src/features/home/HeaderSection';
import { WeekNavigation } from '../src/features/home/WeekNavigation';
import { ListView } from '../src/features/home/ListView';
import { TodoCard } from '../src/features/home/TodoCard';
import { NewTodoInput } from '../src/features/home/NewTodoInput';
import { EmptyState } from '../src/features/home/EmptyState';
import { DraggedCardGhost } from '../src/features/home/DraggedCardGhost';
import { DateHeader } from '../src/features/home/DateHeader';

import { TaskActionBottomSheet } from '../src/components/TaskActionBottomSheet';
import { NoteBottomSheet } from '../src/components/NoteBottomSheet';
import { EditTitleBottomSheet } from '../src/components/EditTitleBottomSheet';

type ActiveSheet =
  | { type: 'taskAction'; task: Task }
  | { type: 'note'; task: Task }
  | { type: 'editTitle'; task: Task }
  | null;

/**
 * [UNKNOWN] 정확한 시간대 경계는 미확인. 상식적인 05/12/18시 기준으로 임시 구현.
 * 이름은 헤더에서 아이콘과 같은 줄이 아니라 별도 줄로 표시되므로 여기서는
 * 시간대 인사말만 반환한다 (긴 이름이 아이콘을 화면 밖으로 밀어내지 않도록).
 */
function greetingText(): string {
  const hour = new Date().getHours();
  const period = hour >= 5 && hour <= 11 ? 'morning' : hour >= 12 && hour <= 17 ? 'afternoon' : 'evening';
  return `Good ${period}`;
}

export default function HomeScreen() {
  const theme = useThemeColors();
  const {
    selectedDate,
    viewMode,
    weekDates,
    tasksForSelectedDate,
    tasksByDateForWeek,
    refreshSelectedDate,
    refreshWeek,
    selectDate,
    toggleViewMode,
    addTask,
    toggleCompleted,
    moveToNextDay,
    moveToBacklog,
    moveToDate,
    deleteTask,
    toggleTopTask,
    toggleRoutine,
    moveUp,
    moveDown,
    updateNote,
    updateTitle,
  } = useTaskStore();

  const userName = useSettingsStore((s) => s.userName);

  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);

  // Week Navigation의 요일별 "완료/전체" 표시용 (2번 섹션 참고)
  const progressByDate = useMemo(() => {
    const result: Record<string, { completed: number; total: number }> = {};
    for (const date of weekDates) {
      const tasks = tasksByDateForWeek[date] ?? [];
      result[date] = { completed: tasks.filter((t) => t.isCompleted).length, total: tasks.length };
    }
    return result;
  }, [weekDates, tasksByDateForWeek]);

  // Focus Session 등 모달 화면에서 돌아올 때도 최신 상태를 반영한다
  // (원본은 Room의 Flow로 자동 반영되지만, RN은 재조회 방식이라 필요 - 3번 섹션 참고)
  useFocusEffect(
    useCallback(() => {
      refreshSelectedDate();
      refreshWeek();
    }, [selectedDate])
  );

  // List View는 화면 이동이 아니라 같은 화면 안의 상태 전환이라, 이 화면은
  // 항상 네비게이션 스택의 root다. List View에서 뒤로가기를 누르면
  // (안드로이드 기본 동작대로 그냥 앱이 꺼지는 대신) Week View로 먼저
  // 돌아오게 한다 - 사용자 피드백으로 추가된, 원본에 없던 동작.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (viewMode === 'LIST') {
        toggleViewMode();
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [viewMode, toggleViewMode]);

  // Weekly Reset: 앱 진입 시 1회만 지난 주 미완료 Task 존재 여부 확인.
  useEffect(() => {
    (async () => {
      const weekStart = weekDates[0];
      if (!weekStart) return;
      const alreadyProcessed = await weeklyResetPrefs.isProcessed(weekStart);
      if (alreadyProcessed) return;
      const leftover = await taskQueries.getLeftoverTasks(weekStart);
      if (leftover.length > 0) {
        router.push({ pathname: '/weekly-reset', params: { weekStart } });
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <HeaderSection
          greeting={greetingText()}
          userName={userName}
          subtitle="Focus on what matters"
          onFocusClick={() => router.push('/focus')}
          onViewToggleClick={toggleViewMode}
          onSettingsClick={() => router.push('/settings')}
          onSubtitleClick={() => router.push('/statistics')}
        />

        <View style={{ flex: 1, flexDirection: 'row' }}>
          {viewMode === 'WEEK' && (
            <WeekNavigation
              weekDates={weekDates}
              selectedDate={selectedDate}
              progressByDate={progressByDate}
              showWeekend
              onDaySelected={selectDate}
            />
          )}

          <View style={{ flex: 1 }}>
            {viewMode === 'WEEK' ? (
              <>
                <DateHeader date={selectedDate} />
                <View style={{ flex: 1 }}>
                  {tasksForSelectedDate.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <View style={{ padding: 16, gap: 8 }}>
                      {tasksForSelectedDate.map((task) => (
                        <TodoCard
                          key={task.id}
                          task={task}
                          variant="WEEK"
                          onToggleComplete={() => toggleCompleted(task)}
                          onSwipedToNextDay={() => moveToNextDay(task)}
                          onSwipedLeft={() => setActiveSheet({ type: 'taskAction', task })}
                          onDroppedOnBacklog={() => moveToBacklog(task)}
                          onDroppedOnDate={(date) => moveToDate(task, date)}
                        />
                      ))}
                    </View>
                  )}
                </View>
              </>
            ) : (
              <ListView
                weekDates={weekDates}
                tasksByDate={tasksByDateForWeek}
                onToggleComplete={toggleCompleted}
                onSwipedToNextDay={moveToNextDay}
                onSwipedLeft={(task) => setActiveSheet({ type: 'taskAction', task })}
                onDroppedOnBacklog={moveToBacklog}
                onDroppedOnDate={moveToDate}
              />
            )}

            <NewTodoInput onSubmit={addTask} />
          </View>
        </View>
      </SafeAreaView>

      {/* Long-press+Drag 고스트 - SafeAreaView 밖(화면 절대좌표 원점)에 최상단으로 배치 */}
      <DraggedCardGhost variant={viewMode === 'WEEK' ? 'WEEK' : 'LIST'} />

      <TaskActionBottomSheet
        visible={activeSheet?.type === 'taskAction'}
        isTopTask={activeSheet?.type === 'taskAction' ? activeSheet.task.isTopTask : false}
        isRoutine={activeSheet?.type === 'taskAction' ? activeSheet.task.isRoutine : false}
        onTopTask={() => activeSheet?.type === 'taskAction' && toggleTopTask(activeSheet.task)}
        onRepeatWeekly={() => activeSheet?.type === 'taskAction' && toggleRoutine(activeSheet.task)}
        onCreateCalendarEvent={() => {
          if (activeSheet?.type !== 'taskAction' || !activeSheet.task.date) return;
          const start = fromISODate(activeSheet.task.date);
          createEventInCalendarAsync({
            title: activeSheet.task.title,
            startDate: start,
            endDate: addDays(start, 1),
            allDay: true,
          });
        }}
        onEdit={() => activeSheet?.type === 'taskAction' && setActiveSheet({ type: 'editTitle', task: activeSheet.task })}
        onAddNote={() => activeSheet?.type === 'taskAction' && setActiveSheet({ type: 'note', task: activeSheet.task })}
        onMoveUp={() => activeSheet?.type === 'taskAction' && moveUp(activeSheet.task)}
        onMoveDown={() => activeSheet?.type === 'taskAction' && moveDown(activeSheet.task)}
        onDelete={() => activeSheet?.type === 'taskAction' && deleteTask(activeSheet.task)}
        onDismiss={() => setActiveSheet(null)}
      />

      <NoteBottomSheet
        visible={activeSheet?.type === 'note'}
        taskTitle={activeSheet?.type === 'note' ? activeSheet.task.title : ''}
        initialNote={activeSheet?.type === 'note' ? activeSheet.task.note ?? '' : ''}
        onSave={(note) => activeSheet?.type === 'note' && updateNote(activeSheet.task, note)}
        onDismiss={() => setActiveSheet(null)}
      />

      <EditTitleBottomSheet
        visible={activeSheet?.type === 'editTitle'}
        initialTitle={activeSheet?.type === 'editTitle' ? activeSheet.task.title : ''}
        onSave={(title) => activeSheet?.type === 'editTitle' && updateTitle(activeSheet.task, title)}
        onDismiss={() => setActiveSheet(null)}
      />
    </View>
  );
}
