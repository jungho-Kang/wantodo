/**
 * Task 스키마 (SQLite 테이블 정의).
 *
 * - date == null 이면 Backlog 상태 (섹션 5, 9.1)
 * - isTopTask, isRoutine 은 동시에 true 일 수 있음 (섹션 4.3)
 * - note 는 2줄까지 홈에서 표시, 상세는 Bottom Sheet (섹션 4.6)
 *
 * date 는 Room 의 LocalDate 를 'YYYY-MM-DD' ISO 문자열로 보존한다.
 */
export interface Task {
  id: number;
  title: string;
  note: string | null;
  /** null 이면 Backlog. 특정 날짜에 할당되면 'YYYY-MM-DD'. */
  date: string | null;
  isCompleted: boolean;
  /** Task Action Bottom Sheet 의 "Top task" (Master Spec 6번) */
  isTopTask: boolean;
  /** Task Action Bottom Sheet 의 "Repeat weekly" (Master Spec 6번, PRO) */
  isRoutine: boolean;
  /** 같은 날짜 내 정렬 순서. Top Task 는 이 값과 무관하게 최상단 그룹. */
  sortOrder: number;
  createdAt: number;
}

export const DB_NAME = 'tasks.db';
export const DB_VERSION = 1;

export const CREATE_TASKS_TABLE = `
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  note TEXT,
  date TEXT,
  isCompleted INTEGER NOT NULL DEFAULT 0,
  isTopTask INTEGER NOT NULL DEFAULT 0,
  isRoutine INTEGER NOT NULL DEFAULT 0,
  sortOrder INTEGER NOT NULL,
  createdAt INTEGER NOT NULL
);
`;

export const CREATE_TASKS_DATE_INDEX = `
CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
`;
