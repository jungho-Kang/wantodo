/**
 * 원본: ui/statistics/StatisticsBottomSheet.kt 의 private BacklogTab (Master Spec 9.1)
 * 이미 있던 taskStore.backlog/loadBacklog을 재사용한다.
 *
 * 완료 체크박스 + 요일로 이동은 원본에 확인된 상호작용은 아니지만, Backlog가
 * 완료 처리도 못 하고 요일 배정도 못 하면 사실상 죽은 목록이라 사용자
 * 요청으로 추가함 (Weekly Reset의 요일 배정과 동일한 패턴 재사용).
 *
 * 오른쪽 스와이프 삭제도 같은 이유로 사용자 요청 추가 - Home의 TodoCard가
 * 오른쪽 스와이프를 "다음 날짜로 이동"에 쓰고 있어서, Backlog는 날짜 이동을
 * 이미 캘린더 아이콘으로 처리하므로 오른쪽 스와이프를 삭제 전용으로 쓴다
 * (실수로 지우는 걸 막기 위해 Alert 확인 필수).
 */
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Text } from '../../components/Text';
import { useFocusEffect } from 'expo-router';
import { format } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTaskStore } from '../../store/taskStore';
import * as taskQueries from '../../db/taskQueries';
import { fromISODate } from '../../lib/dates';
import { useActivePalette } from '../../theme/useActivePalette';
import { useThemeColors } from '../../theme/useThemeColors';
import { DeleteRed } from '../../theme/colors';
import type { Task } from '../../db/schema';

const DELETE_COMMIT_THRESHOLD = 96;

export function BacklogTab() {
  const theme = useThemeColors();
  const backlog = useTaskStore((s) => s.backlog);
  const weekDates = useTaskStore((s) => s.weekDates);
  const loadBacklog = useTaskStore((s) => s.loadBacklog);
  const toggleCompleted = useTaskStore((s) => s.toggleCompleted);
  const moveToDate = useTaskStore((s) => s.moveToDate);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const [text, setText] = useState('');
  const [movingTaskId, setMovingTaskId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadBacklog();
    }, [])
  );

  async function submit() {
    const title = text.trim();
    if (!title) return;
    await taskQueries.insertTask({
      title,
      note: null,
      date: null,
      isCompleted: false,
      isTopTask: false,
      isRoutine: false,
    });
    setText('');
    loadBacklog();
  }

  async function assignToDate(task: Task, date: string) {
    await moveToDate(task, date);
    setMovingTaskId(null);
    loadBacklog();
  }

  function confirmDelete(task: Task) {
    Alert.alert('Delete task?', `"${task.title}" will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTask(task) },
    ]);
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {backlog.length === 0 ? (
          <View style={{ paddingVertical: 48, alignItems: 'center', gap: 8 }}>
            <MaterialIcons name="inventory-2" size={24} color={theme.textTertiary} />
            <Text style={{ fontSize: 14, color: theme.textSecondary }}>No tasks in backlog</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
            {backlog.map((task) => (
              <BacklogTaskRow
                key={task.id}
                task={task}
                weekDates={weekDates}
                isMoving={movingTaskId === task.id}
                onToggleMoving={() => setMovingTaskId(movingTaskId === task.id ? null : task.id)}
                onToggleCompleted={() => toggleCompleted(task)}
                onAssignToDate={(date) => assignToDate(task, date)}
                onRequestDelete={() => confirmDelete(task)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16 }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="New task..."
          placeholderTextColor={theme.textTertiary}
          onSubmitEditing={submit}
          returnKeyType="done"
          style={{
            flex: 1,
            backgroundColor: theme.surface,
            borderRadius: 28,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 16,
            color: theme.text,
          }}
        />
        <Pressable
          onPress={submit}
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: '#000',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

function BacklogTaskRow({
  task,
  weekDates,
  isMoving,
  onToggleMoving,
  onToggleCompleted,
  onAssignToDate,
  onRequestDelete,
}: {
  task: Task;
  weekDates: string[];
  isMoving: boolean;
  onToggleMoving: () => void;
  onToggleCompleted: () => void;
  onAssignToDate: (date: string) => void;
  onRequestDelete: () => void;
}) {
  const { accentColor } = useActivePalette();
  const theme = useThemeColors();
  const offsetX = useSharedValue(0);

  const swipeGesture = Gesture.Pan()
    .minDistance(10)
    .activeOffsetX([-99999, 10])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      offsetX.value = Math.max(0, e.translationX);
    })
    .onEnd(() => {
      if (offsetX.value > DELETE_COMMIT_THRESHOLD) {
        runOnJS(onRequestDelete)();
      }
      offsetX.value = withTiming(0, { duration: 150 });
    });

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }],
  }));

  const revealStyle = useAnimatedStyle(() => ({
    opacity: offsetX.value > 0 ? 1 : 0,
  }));

  return (
    <View style={{ borderRadius: 12, overflow: 'hidden' }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            borderRadius: 12,
            backgroundColor: DeleteRed,
            justifyContent: 'center',
            paddingLeft: 16,
          },
          revealStyle,
        ]}
        pointerEvents="none"
      >
        <MaterialIcons name="delete" size={22} color="#fff" />
      </Animated.View>

      <GestureDetector gesture={swipeGesture}>
        <Animated.View
          style={[
            {
              backgroundColor: theme.surface,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
            },
            bodyStyle,
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable onPress={onToggleCompleted} hitSlop={8}>
              <MaterialIcons
                name={task.isCompleted ? 'check-box' : 'check-box-outline-blank'}
                size={22}
                color={task.isCompleted ? accentColor : theme.textSecondary}
              />
            </Pressable>
            <View style={{ width: 12 }} />
            <Text
              style={{
                flex: 1,
                fontSize: 16,
                textDecorationLine: task.isCompleted ? 'line-through' : 'none',
                color: task.isCompleted ? theme.textSecondary : theme.text,
              }}
            >
              {task.title}
            </Text>
            <Pressable onPress={onToggleMoving} hitSlop={8}>
              <MaterialIcons name="event" size={20} color={isMoving ? accentColor : theme.textTertiary} />
            </Pressable>
          </View>

          {isMoving && (
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 12 }}>
              {weekDates.map((date) => (
                <Pressable
                  key={date}
                  onPress={() => onAssignToDate(date)}
                  style={{
                    flex: 1,
                    backgroundColor: theme.surfaceElevated,
                    borderRadius: 8,
                    paddingVertical: 8,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 11 }}>{format(fromISODate(date), 'EEE').toUpperCase()}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
