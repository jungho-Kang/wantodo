/**
 * 원본: ui/weeklyreset/WeeklyResetViewModel.kt (Master Spec 8번)
 *
 * "이전 할당 되돌리기" 버튼은 실기기 영상으로 확인되지 않아 [UNKNOWN]으로
 * 되돌려졌으므로 여기서도 구현하지 않는다 - 앞으로만 진행 가능하다.
 *
 * 원본은 DayOfWeek.value(1=월~7=일) 기준으로 weekStart에 더했는데, RN은
 * offset(0=월~6=일)으로 단순화해 addDaysISO(weekStart, offset)로 동일하게
 * 계산한다.
 */
import { useCallback, useEffect, useState } from 'react';
import * as taskQueries from '../../db/taskQueries';
import type { Task } from '../../db/schema';
import { addDaysISO } from '../../lib/dates';

export const WEEKDAYS: { label: string; offset: number }[] = [
  { label: 'MON', offset: 0 },
  { label: 'TUE', offset: 1 },
  { label: 'WED', offset: 2 },
  { label: 'THU', offset: 3 },
  { label: 'FRI', offset: 4 },
  { label: 'SAT', offset: 5 },
  { label: 'SUN', offset: 6 },
];

type HistoryEntry = { action: 'assigned' | 'deleted' };

export function useWeeklyReset(weekStart: string) {
  const [leftoverTasks, setLeftoverTasks] = useState<Task[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    (async () => {
      const leftover = await taskQueries.getLeftoverTasks(weekStart);
      setLeftoverTasks(leftover);
      setIsComplete(leftover.length === 0);
      setIsLoading(false);
    })();
  }, [weekStart]);

  const advance = useCallback(
    (entry: HistoryEntry) => {
      setHistory((h) => [...h, entry]);
      setCurrentIndex((current) => {
        const next = current + 1;
        setIsComplete(next >= leftoverTasks.length);
        return next;
      });
    },
    [leftoverTasks.length]
  );

  const assignToDay = useCallback(
    async (offset: number) => {
      const task = leftoverTasks[currentIndex];
      if (!task) return;
      const targetDate = addDaysISO(weekStart, offset);
      await taskQueries.moveToDate(task.id, targetDate);
      advance({ action: 'assigned' });
    },
    [leftoverTasks, currentIndex, weekStart, advance]
  );

  const deleteCurrent = useCallback(async () => {
    const task = leftoverTasks[currentIndex];
    if (!task) return;
    await taskQueries.deleteTask(task.id);
    advance({ action: 'deleted' });
  }, [leftoverTasks, currentIndex, advance]);

  /** 직전 항목이 "배정"이었을 때만 되돌릴 수 있다 - "삭제"는 복구 불가능하므로 되돌리지 않는다. */
  const canGoBack = history.length > 0 && history[history.length - 1].action === 'assigned';

  const goBack = useCallback(() => {
    if (!canGoBack) return;
    setHistory((h) => h.slice(0, -1));
    setCurrentIndex((current) => current - 1);
    setIsComplete(false);
  }, [canGoBack]);

  const total = leftoverTasks.length;
  const displayIndex = Math.min(currentIndex + 1, total);
  const currentTask = leftoverTasks[currentIndex] ?? null;

  return {
    isLoading,
    isComplete,
    total,
    displayIndex,
    currentTask,
    canGoBack,
    assignToDay,
    deleteCurrent,
    goBack,
  };
}
