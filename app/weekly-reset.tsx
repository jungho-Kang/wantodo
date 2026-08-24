/**
 * 원본: ui/weeklyreset/WeeklyResetScreen.kt (Master Spec 8번)
 * "NEW WEEK - Assign tasks" -> 요일 버튼/Delete로 하나씩 처리 ->
 * "All tasks assigned! / Your week is ready!" -> Continue.
 *
 * app/index.tsx 가 지난 주 leftover Task 감지 시 weekStart 파라미터와
 * 함께 이 화면으로 이동시킨다. Continue 시점에 이번 주를 "처리 완료"로
 * 기록해(WeeklyResetPrefs 대응) leftover 유무와 무관하게 이번 주엔
 * 다시 뜨지 않게 한다.
 */
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWeeklyReset, WEEKDAYS } from '../src/features/weeklyreset/useWeeklyReset';
import * as weeklyResetPrefs from '../src/db/weeklyResetPrefs';
import { weekDatesFor, todayISODate } from '../src/lib/dates';
import { AccentTeal, DeleteRed } from '../src/theme/colors';

export default function WeeklyResetScreen() {
  const { weekStart: weekStartParam } = useLocalSearchParams<{ weekStart?: string }>();
  const weekStart = weekStartParam ?? weekDatesFor(todayISODate())[0];
  const reset = useWeeklyReset(weekStart);

  async function handleFinished() {
    await weeklyResetPrefs.markProcessed(weekStart);
    router.back();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {reset.isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      ) : reset.isComplete ? (
        <CompletedContent onFinished={handleFinished} />
      ) : (
        <AssignContent
          displayIndex={reset.displayIndex}
          total={reset.total}
          currentTaskTitle={reset.currentTask?.title ?? ''}
          canGoBack={reset.canGoBack}
          onAssign={reset.assignToDay}
          onDelete={reset.deleteCurrent}
          onGoBack={reset.goBack}
        />
      )}
    </SafeAreaView>
  );
}

function AssignContent({
  displayIndex,
  total,
  currentTaskTitle,
  canGoBack,
  onAssign,
  onDelete,
  onGoBack,
}: {
  displayIndex: number;
  total: number;
  currentTaskTitle: string;
  canGoBack: boolean;
  onAssign: (offset: number) => void;
  onDelete: () => void;
  onGoBack: () => void;
}) {
  const progress = total > 0 ? displayIndex / total : 0;

  return (
    <View style={{ flex: 1, padding: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>NEW WEEK</Text>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Assign tasks</Text>
        </View>
        {canGoBack && (
          <Pressable
            onPress={onGoBack}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 4 }}
          >
            <MaterialIcons name="arrow-back" size={18} color="rgba(0,0,0,0.6)" />
            <Text style={{ marginLeft: 4, fontSize: 14, color: 'rgba(0,0,0,0.6)' }}>Back</Text>
          </Pressable>
        )}
      </View>

      <View style={{ height: 16 }} />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 14 }}>
          {displayIndex} of {total}
        </Text>
        <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.5)' }}>Last Week</Text>
      </View>
      <View style={{ height: 4 }} />
      <View style={{ height: 4, backgroundColor: '#eee', borderRadius: 2 }}>
        <View style={{ height: 4, width: `${progress * 100}%`, backgroundColor: AccentTeal, borderRadius: 2 }} />
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ backgroundColor: '#F7F5F9', borderRadius: 16, paddingVertical: 32, alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>{currentTaskTitle}</Text>
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ flexDirection: 'row', gap: 6 }}>
        {WEEKDAYS.map((day) => (
          <Pressable
            key={day.label}
            onPress={() => onAssign(day.offset)}
            style={{ flex: 1, backgroundColor: '#F7F5F9', borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 12 }}>{day.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ height: 20 }} />

      <Pressable onPress={onDelete} style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <MaterialIcons name="delete" size={20} color={DeleteRed} />
        <Text style={{ marginLeft: 8, fontSize: 16, color: DeleteRed }}>Delete task</Text>
      </Pressable>
    </View>
  );
}

function CompletedContent({ onFinished }: { onFinished: () => void }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <View
        style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: AccentTeal, alignItems: 'center', justifyContent: 'center' }}
      >
        <MaterialIcons name="check-circle" size={32} color="#fff" />
      </View>
      <View style={{ height: 16 }} />
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>All tasks assigned</Text>
      <Text style={{ fontSize: 16, marginTop: 4 }}>Your week is ready!</Text>

      <View style={{ height: 32 }} />

      <Pressable
        onPress={onFinished}
        style={{ width: '100%', height: 52, borderRadius: 12, backgroundColor: AccentTeal, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Continue</Text>
      </Pressable>
    </View>
  );
}
