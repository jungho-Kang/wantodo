/**
 * 원본: ui/focus/FocusSessionViewModel.kt (Master Spec 7번)
 *
 * - timerMinutes == null 이면 "No timer" (시간 표시 숨김)
 * - 타이머는 세션 전체 기준 글로벌 타이머. Done & next 를 눌러도
 *   리셋되지 않고 남은 시간에서 계속 카운트다운된다 [CONFIRMED] - 그대로 승계.
 * - 00:00 도달 시 자동 강제 종료된다는 주장은 원본 영상으로 반증되어
 *   [UNKNOWN] 처리했다 - 여기서도 0 에 도달해도 자동으로 화면을 전환하지 않는다.
 *
 * Room의 Flow<List<Task>>는 RN에 자동 구독이 없으므로, 세션 진입 시
 * 오늘 날짜의 미완료 Task를 1회 조회해 availableTasks로 사용한다.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import * as taskQueries from '../../db/taskQueries';
import type { Task } from '../../db/schema';
import { todayISODate } from '../../lib/dates';

export type FocusPhase = 'SETUP' | 'RUNNING' | 'COMPLETED';

export function useFocusSession() {
  const [phase, setPhase] = useState<FocusPhase>('SETUP');
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);

  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      const tasks = await taskQueries.getTasksForDate(todayISODate());
      setAvailableTasks(tasks.filter((t) => !t.isCompleted));
    })();
  }, []);

  useEffect(() => {
    return () => {
      if (tickerRef.current) clearInterval(tickerRef.current);
    };
  }, []);

  const toggleTaskSelection = useCallback((taskId: number) => {
    setSelectedTaskIds((current) =>
      current.includes(taskId) ? current.filter((id) => id !== taskId) : [...current, taskId]
    );
  }, []);

  const startTicker = useCallback((minutes: number | null) => {
    if (tickerRef.current) clearInterval(tickerRef.current);
    if (minutes === null) return; // No timer: 카운트다운 없음
    tickerRef.current = setInterval(() => {
      setRemainingSeconds((s) => Math.max(0, s - 1));
    }, 1000);
  }, []);

  const start = useCallback(() => {
    if (selectedTaskIds.length === 0) return;
    setCurrentQueueIndex(0);
    setRemainingSeconds((timerMinutes ?? 0) * 60);
    setPhase('RUNNING');
    startTicker(timerMinutes);
  }, [selectedTaskIds, timerMinutes, startTicker]);

  const cancel = useCallback(() => {
    if (tickerRef.current) clearInterval(tickerRef.current);
    setPhase('SETUP');
    setCurrentQueueIndex(0);
  }, []);

  /**
   * 현재 Task 완료 처리 후 다음으로. 글로벌 타이머는 리셋하지 않는다
   * (실기기 확인 사실 - Master Spec 7번).
   */
  const doneAndNext = useCallback(() => {
    const taskId = selectedTaskIds[currentQueueIndex];
    const task = taskId !== undefined ? availableTasks.find((t) => t.id === taskId) : undefined;
    if (task) {
      taskQueries.setCompleted(task.id, true);
    }

    const nextIndex = currentQueueIndex + 1;
    if (nextIndex >= selectedTaskIds.length) {
      if (tickerRef.current) clearInterval(tickerRef.current);
      setPhase('COMPLETED');
    } else {
      setCurrentQueueIndex(nextIndex);
    }
  }, [selectedTaskIds, currentQueueIndex, availableTasks]);

  const canStart = selectedTaskIds.length > 0;
  const currentTaskId = selectedTaskIds[currentQueueIndex];
  const nextTaskId = selectedTaskIds[currentQueueIndex + 1];
  const currentTask = currentTaskId !== undefined ? availableTasks.find((t) => t.id === currentTaskId) ?? null : null;
  const nextTask = nextTaskId !== undefined ? availableTasks.find((t) => t.id === nextTaskId) ?? null : null;

  return {
    phase,
    availableTasks,
    selectedTaskIds,
    timerMinutes,
    remainingSeconds,
    canStart,
    currentTask,
    nextTask,
    setTimerMinutes,
    toggleTaskSelection,
    start,
    cancel,
    doneAndNext,
  };
}
