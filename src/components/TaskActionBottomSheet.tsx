/**
 * 원본: ui/components/TaskActionBottomSheet.kt (Master Spec 6번)
 * Left Swipe로 호출된다.
 *
 * 구성 순서 고정: Top task -> Repeat weekly[PRO] -> Create calendar
 * event[PRO] -> Edit -> Add note -> Delete(빨간색).
 *
 * PRO Badge는 무료체험 상태에서는 표시하지 않는다. isProUnlocked로
 * 추후 결제 상태 연동 시 배지 표시를 제어한다 (현재는 무료체험 가정 true).
 *
 * Move up/Move down은 원본에 없던 기능 - List View 드래그 핸들이 시각
 * 요소로만 존재하고 실제 순서변경이 안 되는 문제의 대안으로 추가함
 * (사용자 요청, 2026-08-24). Add note와 Delete 사이에 배치.
 */
import { Pressable, View } from 'react-native';
import { Text } from './Text';
import { MaterialIcons } from '@expo/vector-icons';
import { BottomSheet } from './BottomSheet';
import { DeleteRed } from '../theme/colors';
import { useActivePalette } from '../theme/useActivePalette';
import { useThemeColors } from '../theme/useThemeColors';

interface Props {
  visible: boolean;
  isTopTask: boolean;
  isRoutine: boolean;
  isProUnlocked?: boolean;
  onTopTask: () => void;
  onRepeatWeekly: () => void;
  onCreateCalendarEvent: () => void;
  onEdit: () => void;
  onAddNote: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onDismiss: () => void;
}

export function TaskActionBottomSheet({
  visible,
  isTopTask,
  isRoutine,
  isProUnlocked = true,
  onTopTask,
  onRepeatWeekly,
  onCreateCalendarEvent,
  onEdit,
  onAddNote,
  onMoveUp,
  onMoveDown,
  onDelete,
  onDismiss,
}: Props) {
  const runAndDismiss = (action: () => void) => () => {
    action();
    onDismiss();
  };

  return (
    <BottomSheet visible={visible} onDismiss={onDismiss}>
      <View style={{ paddingBottom: 24 }}>
        <ActionRow
          icon="keyboard-arrow-up"
          label={isTopTask ? 'Remove top task' : 'Top task'}
          onPress={runAndDismiss(onTopTask)}
        />
        <ActionRow
          icon="loop"
          label={isRoutine ? 'Stop repeat weekly' : 'Repeat weekly'}
          showProBadge={!isProUnlocked}
          onPress={runAndDismiss(onRepeatWeekly)}
        />
        <ActionRow
          icon="calendar-today"
          label="Create calendar event"
          showProBadge={!isProUnlocked}
          onPress={runAndDismiss(onCreateCalendarEvent)}
        />
        <ActionRow icon="edit" label="Edit" onPress={onEdit} />
        <ActionRow icon="notes" label="Add note" onPress={onAddNote} />
        <ActionRow icon="arrow-upward" label="Move up" onPress={runAndDismiss(onMoveUp)} />
        <ActionRow icon="arrow-downward" label="Move down" onPress={runAndDismiss(onMoveDown)} />
        <ActionRow icon="delete" label="Delete" tint={DeleteRed} onPress={runAndDismiss(onDelete)} />
      </View>
    </BottomSheet>
  );
}

function ActionRow({
  icon,
  label,
  showProBadge = false,
  tint,
  onPress,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  showProBadge?: boolean;
  tint?: string;
  onPress: () => void;
}) {
  const { accentColor } = useActivePalette();
  const theme = useThemeColors();
  const color = tint ?? theme.text;
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingHorizontal: 24,
        paddingVertical: 14,
      }}
    >
      <MaterialIcons name={icon} size={22} color={color} />
      <Text style={{ flex: 1, fontSize: 16, color }}>{label}</Text>
      {showProBadge && (
        <View style={{ backgroundColor: accentColor, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
          <Text style={{ color: '#fff', fontSize: 12 }}>PRO</Text>
        </View>
      )}
    </Pressable>
  );
}
