/**
 * 원본: ui/home/HomeViewModel.kt
 *
 * Room 의 Flow<List<Task>> 는 RN 쪽에서 자동 구독이 없으므로, 각 mutation 뒤
 * 이 store가 해당 쿼리를 재조회해 상태를 갱신하는 방식으로 대체한다.
 */
import { create } from 'zustand';
import * as taskQueries from '../db/taskQueries';
import type { Task } from '../db/schema';
import { addDaysISO, todayISODate, weekDatesFor } from '../lib/dates';
import { useSettingsStore } from './settingsStore';

export type HomeViewMode = 'WEEK' | 'LIST';

/** Settings > General 의 "Completed to bottom" 반영 - 완료된 Task를 그룹 끝으로 (안정 정렬) */
function applyCompletedToBottom(tasks: Task[]): Task[] {
  if (!useSettingsStore.getState().completedToBottom) return tasks;
  return [...tasks].sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted));
}

/** Task Action Bottom Sheet의 "Move up"/"Move down" - 같은 날짜 내 sortOrder를 이웃과 교환 */
async function swapAdjacentSortOrder(task: Task, direction: -1 | 1) {
  if (!task.date) return;
  const siblings = await taskQueries.getTasksForDate(task.date);
  const index = siblings.findIndex((t) => t.id === task.id);
  const neighbor = index === -1 ? undefined : siblings[index + direction];
  if (!neighbor) return;
  await Promise.all([
    taskQueries.setSortOrder(task.id, neighbor.sortOrder),
    taskQueries.setSortOrder(neighbor.id, task.sortOrder),
  ]);
}

interface TaskState {
  selectedDate: string;
  viewMode: HomeViewMode;
  weekDates: string[];
  tasksForSelectedDate: Task[];
  /** List View 용: 이번 주 전체 Task를 날짜별로 그룹화 (date=null 인 Task는 제외) */
  tasksByDateForWeek: Record<string, Task[]>;
  backlog: Task[];

  refreshSelectedDate: () => Promise<void>;
  refreshWeek: () => Promise<void>;
  selectDate: (date: string) => Promise<void>;
  toggleViewMode: () => void;
  loadBacklog: () => Promise<void>;

  addTask: (title: string) => Promise<void>;
  toggleCompleted: (task: Task) => Promise<void>;
  /** Right Swipe 커밋: 항상 다음 날짜로 (Master Spec 5.1) */
  moveToNextDay: (task: Task) => Promise<void>;
  moveToBacklog: (task: Task) => Promise<void>;
  /** Long-press+Drag로 임의 요일에 드롭 (Master Spec 5.2) */
  moveToDate: (task: Task, date: string) => Promise<void>;
  deleteTask: (task: Task) => Promise<void>;
  toggleTopTask: (task: Task) => Promise<void>;
  /** Task Action Bottom Sheet의 "Repeat weekly" (Master Spec 6번, PRO) */
  toggleRoutine: (task: Task) => Promise<void>;
  /** Task Action Bottom Sheet의 "Move up"/"Move down" (원본에 없던 기능) */
  moveUp: (task: Task) => Promise<void>;
  moveDown: (task: Task) => Promise<void>;
  updateNote: (task: Task, note: string) => Promise<void>;
  updateTitle: (task: Task, title: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  selectedDate: todayISODate(),
  viewMode: 'WEEK',
  weekDates: weekDatesFor(todayISODate()),
  tasksForSelectedDate: [],
  tasksByDateForWeek: {},
  backlog: [],

  refreshSelectedDate: async () => {
    const tasks = await taskQueries.getTasksForDate(get().selectedDate);
    set({ tasksForSelectedDate: applyCompletedToBottom(tasks) });
  },

  refreshWeek: async () => {
    const week = get().weekDates;
    const tasks = await taskQueries.getTasksInRange(week[0], week[week.length - 1]);
    const grouped: Record<string, Task[]> = {};
    for (const task of tasks) {
      if (!task.date) continue;
      (grouped[task.date] ??= []).push(task);
    }
    for (const date of Object.keys(grouped)) {
      grouped[date] = applyCompletedToBottom(grouped[date]);
    }
    set({ tasksByDateForWeek: grouped });
  },

  selectDate: async (date) => {
    set({ selectedDate: date, weekDates: weekDatesFor(date) });
    await Promise.all([get().refreshSelectedDate(), get().refreshWeek()]);
  },

  toggleViewMode: () => {
    set({ viewMode: get().viewMode === 'WEEK' ? 'LIST' : 'WEEK' });
  },

  loadBacklog: async () => {
    const backlog = await taskQueries.getBacklog();
    set({ backlog });
  },

  addTask: async (title) => {
    await taskQueries.insertTask({
      title,
      note: null,
      date: get().selectedDate,
      isCompleted: false,
      isTopTask: false,
      isRoutine: false,
    });
    await Promise.all([get().refreshSelectedDate(), get().refreshWeek()]);
  },

  toggleCompleted: async (task) => {
    await taskQueries.setCompleted(task.id, !task.isCompleted);
    await Promise.all([get().refreshSelectedDate(), get().refreshWeek(), get().loadBacklog()]);
  },

  moveToNextDay: async (task) => {
    if (!task.date) return;
    await taskQueries.moveToDate(task.id, addDaysISO(task.date, 1));
    await Promise.all([get().refreshSelectedDate(), get().refreshWeek()]);
  },

  moveToBacklog: async (task) => {
    await taskQueries.moveToBacklog(task.id);
    await Promise.all([get().refreshSelectedDate(), get().refreshWeek(), get().loadBacklog()]);
  },

  moveToDate: async (task, date) => {
    await taskQueries.moveToDate(task.id, date);
    await Promise.all([get().refreshSelectedDate(), get().refreshWeek()]);
  },

  deleteTask: async (task) => {
    await taskQueries.deleteTask(task.id);
    await Promise.all([get().refreshSelectedDate(), get().refreshWeek(), get().loadBacklog()]);
  },

  toggleTopTask: async (task) => {
    await taskQueries.setTopTask(task.id, !task.isTopTask);
    await Promise.all([get().refreshSelectedDate(), get().refreshWeek()]);
  },

  toggleRoutine: async (task) => {
    await taskQueries.setRoutine(task.id, !task.isRoutine);
    await Promise.all([get().refreshSelectedDate(), get().refreshWeek()]);
  },

  moveUp: async (task) => {
    await swapAdjacentSortOrder(task, -1);
    await Promise.all([get().refreshSelectedDate(), get().refreshWeek()]);
  },

  moveDown: async (task) => {
    await swapAdjacentSortOrder(task, 1);
    await Promise.all([get().refreshSelectedDate(), get().refreshWeek()]);
  },

  updateNote: async (task, note) => {
    await taskQueries.setNote(task.id, note.trim() ? note : null);
    await Promise.all([get().refreshSelectedDate(), get().refreshWeek()]);
  },

  updateTitle: async (task, title) => {
    await taskQueries.setTitle(task.id, title);
    await Promise.all([get().refreshSelectedDate(), get().refreshWeek()]);
  },
}));
