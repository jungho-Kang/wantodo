/**
 * 원본: ui/home/DraggedCardGhost.kt (Master Spec 5.2)
 *
 * Long-press+Drag 중 손가락을 그대로 따라다니는 카드 "고스트". TodoCard 와
 * 동일한 TodoCardBody 를 재사용해서 실제 카드와 모양이 100% 동일하다.
 *
 * HomeScreen 최상위(화면 전체를 덮는 root 좌표계) 안에, 다른 모든 콘텐츠보다
 * 나중에(=위에) 배치해야 한다. useDragStore().pointerPosition 은
 * TodoCard 쪽에서 GestureDetector의 absoluteX/Y(화면 절대좌표)를 그대로
 * 사용하므로, 이 오버레이도 화면 좌상단이 원점인 좌표계에 배치돼야 정확히
 * 겹친다.
 */
import { View } from 'react-native';
import { useDragStore } from '../../store/dragStore';
import { TodoCardBody, type TodoCardVariant } from './TodoCard';

export function DraggedCardGhost({ variant }: { variant: TodoCardVariant }) {
  const isDragging = useDragStore((s) => s.isDragging);
  const draggedTask = useDragStore((s) => s.draggedTask);
  const pointerPosition = useDragStore((s) => s.pointerPosition);
  const grabOffset = useDragStore((s) => s.grabOffset);
  const draggedCardSize = useDragStore((s) => s.draggedCardSize);

  if (!isDragging || !draggedTask) return null;

  // 고스트 좌상단 = 현재 손가락 위치 - 처음 손가락이 카드를 잡은 지점.
  // 즉, 손가락과 카드 사이의 상대 위치가 드래그 내내 그대로 유지된다.
  const left = pointerPosition.x - grabOffset.x;
  const top = pointerPosition.y - grabOffset.y;

  return (
    <View
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      pointerEvents="none"
    >
      <TodoCardBody
        task={draggedTask}
        variant={variant}
        onToggleComplete={() => {}}
        style={{
          position: 'absolute',
          left,
          top,
          width: draggedCardSize.width > 0 ? draggedCardSize.width : undefined,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 12,
          opacity: 0.97,
          transform: [{ scale: 1.03 }],
        }}
      />
    </View>
  );
}
