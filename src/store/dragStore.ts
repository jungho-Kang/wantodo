/**
 * 원본: ui/home/DragAndDropState.kt
 * Long-press + Drag (Master Spec 5.2) 상태를 여러 컴포넌트(TodoCard,
 * HeaderSection, WeekNavigation, ListView) 간에 공유하기 위한 store.
 *
 * 흐름:
 * 1. TodoCard 에서 long-press 인식 -> startDrag()
 * 2. 드래그 중 손가락의 화면 절대좌표(absoluteX/Y)로 updatePosition() 호출
 * 3. HeaderSection 의 Backlog pill, WeekNavigation/ListView 의 각 날짜
 *    행이 자신의 화면상 영역(Rect)을 registerTarget() 으로 등록
 * 4. 손을 떼면 endDrag() 가 현재 손가락 위치가 걸쳐있는 타겟을 찾아
 *    반환한다.
 */
import { create } from 'zustand';
import type { Task } from '../db/schema';

export type DropTarget = { type: 'backlog' } | { type: 'day'; date: string };

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

function targetKey(target: DropTarget): string {
  return target.type === 'backlog' ? 'backlog' : `day:${target.date}`;
}

function rectContains(rect: Rect, point: Point): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

interface DragState {
  isDragging: boolean;
  draggedTask: Task | null;
  pointerPosition: Point;
  draggedCardSize: Size;
  grabOffset: Point;
  hoveredTarget: DropTarget | null;
  targets: Map<string, { target: DropTarget; rect: Rect }>;

  registerTarget: (target: DropTarget, rect: Rect) => void;
  clearTarget: (target: DropTarget) => void;
  startDrag: (task: Task, position: Point, cardSize: Size, grabOffset: Point) => void;
  updatePosition: (position: Point) => void;
  /** 손을 뗀 시점의 타겟을 반환하고 상태를 초기화한다. */
  endDrag: () => DropTarget | null;
  cancelDrag: () => void;
}

export const useDragStore = create<DragState>((set, get) => ({
  isDragging: false,
  draggedTask: null,
  pointerPosition: { x: 0, y: 0 },
  draggedCardSize: { width: 0, height: 0 },
  grabOffset: { x: 0, y: 0 },
  hoveredTarget: null,
  targets: new Map(),

  registerTarget: (target, rect) => {
    get().targets.set(targetKey(target), { target, rect });
  },

  clearTarget: (target) => {
    get().targets.delete(targetKey(target));
  },

  startDrag: (task, position, cardSize, grabOffset) => {
    set({
      isDragging: true,
      draggedTask: task,
      pointerPosition: position,
      draggedCardSize: cardSize,
      grabOffset,
      hoveredTarget: resolveTarget(get().targets, position),
    });
  },

  updatePosition: (position) => {
    set({ pointerPosition: position, hoveredTarget: resolveTarget(get().targets, position) });
  },

  endDrag: () => {
    const result = resolveTarget(get().targets, get().pointerPosition);
    reset(set);
    return result;
  },

  cancelDrag: () => reset(set),
}));

function resolveTarget(
  targets: Map<string, { target: DropTarget; rect: Rect }>,
  position: Point
): DropTarget | null {
  for (const { target, rect } of targets.values()) {
    if (rectContains(rect, position)) return target;
  }
  return null;
}

function reset(set: (partial: Partial<DragState>) => void) {
  set({
    isDragging: false,
    draggedTask: null,
    hoveredTarget: null,
    draggedCardSize: { width: 0, height: 0 },
    grabOffset: { x: 0, y: 0 },
  });
}
