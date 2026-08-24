/**
 * 원본: ui/home/TodoCard.kt (Master Spec 4.3~4.6, 5번, 6번) + DragAndDropState.kt
 *
 * 원본은 하나의 pointerInput 안에서 "이동 거리가 먼저 임계값(touchSlop)을
 * 넘으면 스와이프, 안 움직이고 longPressTimeout이 먼저 지나면 Move 모드"로
 * 직접 분기했다. RN에서는 Gesture Handler의 Gesture.Race()로 이를
 * 재현한다 - swipe용 Pan(minDistance)과 drag용 Pan(activateAfterLongPress)을
 * 경쟁시켜 동일한 분기를 만든다.
 *
 * - 즉시(짧게) 좌우로 밀면: Swipe (5.1 다음 날짜 이동 / 5.3 Bottom Sheet)
 * - Long-press 후 움직이면: Move 모드 (5.2, useDragStore를 통해
 *   HeaderSection/WeekNavigation/ListView 의 Backlog pill·요일 행과 상호작용)
 */
import { useCallback, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useDragStore, type DropTarget } from '../../store/dragStore';
import type { Task } from '../../db/schema';
import { LightSurfaceCard, RightSwipeArrow } from '../../theme/colors';

export type TodoCardVariant = 'WEEK' | 'LIST';

const COMMIT_THRESHOLD = 96;
const LONG_PRESS_MS = 500;

export function TodoCard({
  task,
  variant = 'WEEK',
  onToggleComplete,
  onSwipedToNextDay,
  onSwipedLeft = () => {},
  onDroppedOnBacklog = () => {},
  onDroppedOnDate = () => {},
  onClick,
}: {
  task: Task;
  variant?: TodoCardVariant;
  onToggleComplete: () => void;
  onSwipedToNextDay: () => void;
  onSwipedLeft?: () => void;
  onDroppedOnBacklog?: () => void;
  onDroppedOnDate?: (date: string) => void;
  onClick?: () => void;
}) {
  const offsetX = useSharedValue(0);
  const [isMoveMode, setIsMoveMode] = useState(false);
  const cardSizeRef = useRef({ width: 0, height: 0 });

  const startDrag = useDragStore((s) => s.startDrag);
  const updatePosition = useDragStore((s) => s.updatePosition);
  const endDrag = useDragStore((s) => s.endDrag);

  const handleDragStart = useCallback(
    (position: { x: number; y: number }, grabOffset: { x: number; y: number }) => {
      setIsMoveMode(true);
      startDrag(task, position, cardSizeRef.current, grabOffset);
    },
    [task, startDrag]
  );

  const handleDragEnd = useCallback(() => {
    setIsMoveMode(false);
    const target: DropTarget | null = endDrag();
    if (!target) return;
    if (target.type === 'backlog') onDroppedOnBacklog();
    else onDroppedOnDate(target.date);
  }, [endDrag, onDroppedOnBacklog, onDroppedOnDate]);

  const swipePan = Gesture.Pan()
    .minDistance(10)
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      offsetX.value = e.translationX;
    })
    .onEnd(() => {
      if (offsetX.value > COMMIT_THRESHOLD) {
        runOnJS(onSwipedToNextDay)();
      } else if (offsetX.value < -COMMIT_THRESHOLD) {
        runOnJS(onSwipedLeft)();
      }
      offsetX.value = withTiming(0, { duration: 150 });
    });

  const dragPan = Gesture.Pan()
    .activateAfterLongPress(LONG_PRESS_MS)
    .onStart((e) => {
      runOnJS(handleDragStart)(
        { x: e.absoluteX, y: e.absoluteY },
        { x: e.x, y: e.y }
      );
    })
    .onUpdate((e) => {
      runOnJS(updatePosition)({ x: e.absoluteX, y: e.absoluteY });
    })
    .onEnd(() => {
      runOnJS(handleDragEnd)();
    });

  const gesture = Gesture.Race(swipePan, dragPan);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }],
    opacity: isMoveMode ? 0.35 : 1,
    elevation: isMoveMode ? 8 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isMoveMode ? 0.25 : 0,
    shadowRadius: isMoveMode ? 6 : 0,
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    opacity: offsetX.value > 0 ? 1 : 0,
  }));

  return (
    <View
      style={{ width: '100%' }}
      onLayout={(e) => {
        cardSizeRef.current = { width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height };
      }}
    >
      <Animated.View
        style={[
          { position: 'absolute', left: 8, top: 0, bottom: 0, justifyContent: 'center' },
          arrowStyle,
        ]}
        pointerEvents="none"
      >
        <MaterialIcons name="arrow-forward" size={22} color={RightSwipeArrow} />
      </Animated.View>

      <GestureDetector gesture={gesture}>
        <Animated.View style={bodyStyle}>
          <TodoCardBody task={task} variant={variant} onToggleComplete={onToggleComplete} onClick={onClick} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

/**
 * TodoCard 의 실제 시각적 내용(체크박스/제목/노트/뱃지). 실제 카드(TodoCard)와
 * 드래그 중 손가락을 따라다니는 고스트(DraggedCardGhost)가 이 컴포넌트를
 * 공유해서 두 곳의 모양이 항상 100% 동일하게 유지되도록 한다.
 */
export function TodoCardBody({
  task,
  variant,
  onToggleComplete,
  onClick,
  style,
}: {
  task: Task;
  variant: TodoCardVariant;
  onToggleComplete: () => void;
  onClick?: (() => void) | null;
  style?: object;
}) {
  const checkedIcon = variant === 'LIST' ? 'check-circle' : 'check-box';
  const uncheckedIcon = variant === 'LIST' ? 'radio-button-unchecked' : 'check-box-outline-blank';

  const content = (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 14,
          backgroundColor: LightSurfaceCard,
          paddingHorizontal: 16,
          paddingVertical: 13,
        },
        style,
      ]}
    >
      <Pressable onPress={onToggleComplete} hitSlop={8}>
        <MaterialIcons name={task.isCompleted ? checkedIcon : uncheckedIcon} size={24} />
      </Pressable>

      <View style={{ width: 12 }} />

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            textDecorationLine: task.isCompleted ? 'line-through' : 'none',
            color: task.isCompleted ? 'rgba(0,0,0,0.5)' : '#000',
          }}
        >
          {task.title}
        </Text>
        {!!task.note?.trim() && (
          <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)' }} numberOfLines={2}>
            {task.note}
          </Text>
        )}
      </View>

      {task.isTopTask && <MaterialIcons name="keyboard-arrow-up" size={20} />}
      {task.isRoutine && <MaterialIcons name="loop" size={20} />}

      {variant === 'LIST' && (
        <>
          <View style={{ width: 8 }} />
          <MaterialIcons name="drag-handle" size={20} color="rgba(0,0,0,0.4)" />
        </>
      )}
    </View>
  );

  if (onClick) {
    return <Pressable onPress={onClick}>{content}</Pressable>;
  }
  return content;
}
