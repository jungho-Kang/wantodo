/**
 * 원본: ui/focus/FocusSessionScreen.kt (Master Spec 7번)
 * Header Focus 아이콘에서 진입 (원본은 로컬 state로 전체화면 오버레이,
 * RN은 _layout.tsx의 fullScreenModal 라우트로 대체 — 기능은 동일).
 */
import { useEffect } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '../src/components/Text';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFocusSession } from '../src/features/focus/useFocusSession';
import { TimerWheelPicker } from '../src/features/focus/TimerWheelPicker';
import { useActivePalette } from '../src/theme/useActivePalette';
import { useThemeColors } from '../src/theme/useThemeColors';

export default function FocusSessionScreen() {
  const session = useFocusSession();
  const theme = useThemeColors();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {session.phase === 'SETUP' && <FocusSetupContent session={session} onClose={() => router.back()} />}
      {session.phase === 'RUNNING' && <FocusRunningContent session={session} />}
      {session.phase === 'COMPLETED' && <FocusCompletedContent onFinished={() => router.back()} />}
    </SafeAreaView>
  );
}

function FocusSetupContent({
  session,
  onClose,
}: {
  session: ReturnType<typeof useFocusSession>;
  onClose: () => void;
}) {
  const { accentColor } = useActivePalette();
  const theme = useThemeColors();
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Focus Session</Text>
        <Pressable onPress={onClose}>
          <MaterialIcons name="close" size={24} color={theme.text} />
        </Pressable>
      </View>

      <View style={{ height: 16 }} />

      <TimerWheelPicker selected={session.timerMinutes} onSelected={session.setTimerMinutes} />

      <View style={{ height: 16 }} />
      <Text style={{ fontSize: 14, color: theme.textSecondary }}>Today's tasks</Text>
      <View style={{ height: 8 }} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 8 }}>
        {session.availableTasks.map((task) => {
          const isSelected = session.selectedTaskIds.includes(task.id);
          return (
            <Pressable
              key={task.id}
              onPress={() => session.toggleTaskSelection(task.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.surface,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}
            >
              <MaterialIcons
                name={isSelected ? 'check-circle' : 'radio-button-unchecked'}
                size={22}
                color={isSelected ? accentColor : theme.textSecondary}
              />
              <Text style={{ flex: 1, marginLeft: 12, fontSize: 16 }}>{task.title}</Text>
              {/* 드래그 핸들: 시각적으로만 존재, 순서 변경은 다음 단계 TODO */}
              <MaterialIcons name="drag-handle" size={20} color={theme.textTertiary} />
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ height: 16 }} />
      <Pressable
        onPress={session.start}
        disabled={!session.canStart}
        style={{
          height: 52,
          borderRadius: 12,
          backgroundColor: session.canStart ? accentColor : theme.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Start</Text>
      </Pressable>
    </View>
  );
}

function FocusRunningContent({ session }: { session: ReturnType<typeof useFocusSession> }) {
  const { accentColor } = useActivePalette();
  const theme = useThemeColors();
  const minutes = Math.floor(session.remainingSeconds / 60);
  const seconds = session.remainingSeconds % 60;

  return (
    <View style={{ flex: 1, padding: 24, alignItems: 'center' }}>
      <View style={{ flex: 1 }} />

      {session.timerMinutes !== null && (
        <>
          <Text style={{ fontSize: 48, fontWeight: 'bold' }}>
            {minutes}:{String(seconds).padStart(2, '0')}
          </Text>
          <View style={{ height: 32 }} />
        </>
      )}

      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>{session.currentTask?.title ?? ''}</Text>
      {session.nextTask && (
        <>
          <View style={{ height: 12 }} />
          <Text style={{ fontSize: 16, color: theme.textTertiary, textAlign: 'center' }}>{session.nextTask.title}</Text>
        </>
      )}

      <View style={{ flex: 1 }} />

      <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
        <Pressable
          onPress={session.cancel}
          style={{
            flex: 1,
            height: 52,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 16 }}>Cancel</Text>
        </Pressable>
        <Pressable
          onPress={session.doneAndNext}
          style={{
            flex: 1,
            height: 52,
            borderRadius: 12,
            backgroundColor: accentColor,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Done & next</Text>
        </Pressable>
      </View>
    </View>
  );
}

function FocusCompletedContent({ onFinished }: { onFinished: () => void }) {
  const { accentColor } = useActivePalette();
  useEffect(() => {
    const timer = setTimeout(onFinished, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: accentColor,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialIcons name="check-circle" size={32} color="#fff" />
      </View>
      <View style={{ height: 16 }} />
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>All done!</Text>
      <Text style={{ fontSize: 16, marginTop: 4 }}>Well done 🎉</Text>
    </View>
  );
}
