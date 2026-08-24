/**
 * Task CRUD 쿼리.
 *
 * Room 의 Flow<List<Task>> 는 RN 쪽에서 자동 구독이 없으므로, 각 mutation 뒤
 * 호출부(Zustand store)가 해당 쿼리를 재조회해 상태를 갱신하는 방식으로 대체한다.
 */
import { getDb } from './client';
import type { Task } from './schema';

interface TaskRow {
  id: number;
  title: string;
  note: string | null;
  date: string | null;
  isCompleted: number;
  isTopTask: number;
  isRoutine: number;
  sortOrder: number;
  createdAt: number;
}

function mapRow(row: TaskRow): Task {
  return {
    ...row,
    isCompleted: row.isCompleted === 1,
    isTopTask: row.isTopTask === 1,
    isRoutine: row.isRoutine === 1,
  };
}

/**
 * 특정 날짜의 Task 목록.
 * 정렬 규칙(Master Spec 6번): Top Task 그룹이 항상 최상단,
 * 그 다음은 sortOrder 오름차순(작성 순서).
 * "Completed to Bottom" 설정은 store 레벨에서 별도로 재정렬한다.
 */
export async function getTasksForDate(date: string): Promise<Task[]> {
  const rows = await getDb().getAllAsync<TaskRow>(
    'SELECT * FROM tasks WHERE date = ? ORDER BY isTopTask DESC, sortOrder ASC',
    [date]
  );
  return rows.map(mapRow);
}

/** Backlog: date IS NULL (Master Spec 9.1) */
export async function getBacklog(): Promise<Task[]> {
  const rows = await getDb().getAllAsync<TaskRow>(
    'SELECT * FROM tasks WHERE date IS NULL ORDER BY sortOrder ASC'
  );
  return rows.map(mapRow);
}

/** Week Navigation 진행도 표시용 - 날짜 범위 전체 조회 */
export async function getTasksInRange(startDate: string, endDate: string): Promise<Task[]> {
  const rows = await getDb().getAllAsync<TaskRow>(
    'SELECT * FROM tasks WHERE date BETWEEN ? AND ? ORDER BY isTopTask DESC, sortOrder ASC',
    [startDate, endDate]
  );
  return rows.map(mapRow);
}

export async function insertTask(
  task: Omit<Task, 'id' | 'sortOrder' | 'createdAt'> & { sortOrder?: number; createdAt?: number }
): Promise<number> {
  const now = task.createdAt ?? Date.now();
  const sortOrder = task.sortOrder ?? now;
  const result = await getDb().runAsync(
    `INSERT INTO tasks (title, note, date, isCompleted, isTopTask, isRoutine, sortOrder, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      task.title,
      task.note ?? null,
      task.date ?? null,
      task.isCompleted ? 1 : 0,
      task.isTopTask ? 1 : 0,
      task.isRoutine ? 1 : 0,
      sortOrder,
      now,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateTask(task: Task): Promise<void> {
  await getDb().runAsync(
    `UPDATE tasks SET title = ?, note = ?, date = ?, isCompleted = ?, isTopTask = ?, isRoutine = ?, sortOrder = ?
     WHERE id = ?`,
    [
      task.title,
      task.note,
      task.date,
      task.isCompleted ? 1 : 0,
      task.isTopTask ? 1 : 0,
      task.isRoutine ? 1 : 0,
      task.sortOrder,
      task.id,
    ]
  );
}

export async function deleteTask(id: number): Promise<void> {
  await getDb().runAsync('DELETE FROM tasks WHERE id = ?', [id]);
}

export async function getById(id: number): Promise<Task | null> {
  const row = await getDb().getFirstAsync<TaskRow>('SELECT * FROM tasks WHERE id = ?', [id]);
  return row ? mapRow(row) : null;
}

/** Right Swipe: 항상 다음 날짜로만 이동 (Master Spec 5.1) */
export async function moveToDate(taskId: number, newDate: string): Promise<void> {
  await getDb().runAsync('UPDATE tasks SET date = ? WHERE id = ?', [newDate, taskId]);
}

/** Long-press + Drag: Backlog 로 이동 (Master Spec 5.2) */
export async function moveToBacklog(taskId: number): Promise<void> {
  await getDb().runAsync('UPDATE tasks SET date = NULL WHERE id = ?', [taskId]);
}

export async function setCompleted(taskId: number, completed: boolean): Promise<void> {
  await getDb().runAsync('UPDATE tasks SET isCompleted = ? WHERE id = ?', [completed ? 1 : 0, taskId]);
}

/** Task Action Bottom Sheet의 "Move up"/"Move down" - 같은 날짜 내 순서 변경 (원본에 없던 기능) */
export async function setSortOrder(taskId: number, sortOrder: number): Promise<void> {
  await getDb().runAsync('UPDATE tasks SET sortOrder = ? WHERE id = ?', [sortOrder, taskId]);
}

export async function setTopTask(taskId: number, isTop: boolean): Promise<void> {
  await getDb().runAsync('UPDATE tasks SET isTopTask = ? WHERE id = ?', [isTop ? 1 : 0, taskId]);
}

export async function setRoutine(taskId: number, isRoutine: boolean): Promise<void> {
  await getDb().runAsync('UPDATE tasks SET isRoutine = ? WHERE id = ?', [isRoutine ? 1 : 0, taskId]);
}

export async function setNote(taskId: number, note: string | null): Promise<void> {
  await getDb().runAsync('UPDATE tasks SET note = ? WHERE id = ?', [note, taskId]);
}

export async function setTitle(taskId: number, title: string): Promise<void> {
  await getDb().runAsync('UPDATE tasks SET title = ? WHERE id = ?', [title, taskId]);
}

/**
 * Weekly Reset(Master Spec 8번) 대상: weekStart 이전 날짜에 할당돼 있으면서
 * 아직 미완료인 Task. 새 주 시작 후 최초 실행 시 이 목록을
 * "NEW WEEK - Assign tasks" 화면에서 하나씩 처리한다.
 */
export async function getLeftoverTasks(weekStart: string): Promise<Task[]> {
  const rows = await getDb().getAllAsync<TaskRow>(
    'SELECT * FROM tasks WHERE date IS NOT NULL AND date < ? AND isCompleted = 0 ORDER BY date ASC',
    [weekStart]
  );
  return rows.map(mapRow);
}

/**
 * Archive(Master Spec 9.3): weekStart 이전 날짜에 할당된 모든 Task
 * (완료 여부 무관). 읽기 전용으로 표시한다.
 */
export async function getPastTasks(weekStart: string): Promise<Task[]> {
  const rows = await getDb().getAllAsync<TaskRow>(
    'SELECT * FROM tasks WHERE date IS NOT NULL AND date < ? ORDER BY date DESC',
    [weekStart]
  );
  return rows.map(mapRow);
}
