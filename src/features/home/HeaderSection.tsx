/**
 * 원본: ui/home/HeaderSection.kt (Master Spec 2, 3, 5.2)
 *
 * 중요: 우측 아이콘은 정확히 3개 - Focus / View Toggle / Settings.
 * Statistics 는 이 아이콘들과 무관하며, subtitle 텍스트를 탭했을 때
 * Bottom Sheet(RN: /statistics 라우트)로 열린다 (onSubtitleClick).
 *
 * useDragStore().isDragging 인 동안에는 Greeting/subtitle 영역이
 * "Backlog" 알약 버튼으로 전환된다 (Master Spec 5.2). 이 버튼 영역을
 * DropTarget 'backlog'로 등록해 TodoCard 의 Long-press+Drag 종료 시
 * 판정에 사용한다.
 */
import { useEffect, useRef } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../components/Text';
import { MaterialIcons } from '@expo/vector-icons';
import { useDragStore } from '../../store/dragStore';
import { useThemeColors } from '../../theme/useThemeColors';
import { useActivePalette } from '../../theme/useActivePalette';

export function HeaderSection({
  greeting,
  userName,
  subtitle,
  onFocusClick,
  onViewToggleClick,
  onSettingsClick,
  onSubtitleClick,
}: {
  /** 시간대 인사말만("Good afternoon") - 아이콘과 같은 줄이라 이름은 별도 줄로 뺀다 (이름 길이와 무관하게 아이콘이 밀려나지 않도록) */
  greeting: string;
  userName: string;
  subtitle: string;
  onFocusClick: () => void;
  onViewToggleClick: () => void;
  onSettingsClick: () => void;
  onSubtitleClick: () => void;
}) {
  const isDragging = useDragStore((s) => s.isDragging);
  const colors = useThemeColors();

  return (
    <View style={{ padding: 20, backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        {isDragging ? (
          <BacklogPill />
        ) : (
          <Text style={{ fontSize: 21, fontWeight: 'bold' }} numberOfLines={1}>
            {greeting}
          </Text>
        )}

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <HeaderIconButton icon="self-improvement" onPress={onFocusClick} />
          <HeaderIconButton icon="reorder" onPress={onViewToggleClick} />
          <HeaderIconButton icon="settings" onPress={onSettingsClick} />
        </View>
      </View>

      {!isDragging && (
        <>
          <Text style={{ fontSize: 21, fontWeight: 'bold' }} numberOfLines={1} ellipsizeMode="tail">
            {userName}
          </Text>
          <View style={{ height: 4 }} />
          <Pressable
            onPress={onSubtitleClick}
            hitSlop={8}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start' }}
          >
            <Text style={{ fontSize: 14, color: colors.textSecondary, textDecorationLine: 'underline' }}>
              {subtitle}
            </Text>
            <MaterialIcons name="chevron-right" size={16} color={colors.textTertiary} />
          </Pressable>
        </>
      )}
    </View>
  );
}

function BacklogPill() {
  const viewRef = useRef<View>(null);
  const registerTarget = useDragStore((s) => s.registerTarget);
  const clearTarget = useDragStore((s) => s.clearTarget);
  const hoveredTarget = useDragStore((s) => s.hoveredTarget);
  const isHovered = hoveredTarget?.type === 'backlog';
  const colors = useThemeColors();
  const { accentColor } = useActivePalette();

  const measure = () => {
    viewRef.current?.measureInWindow((x, y, width, height) => {
      registerTarget({ type: 'backlog' }, { x, y, width, height });
    });
  };

  useEffect(() => {
    return () => clearTarget({ type: 'backlog' });
  }, []);

  return (
    <View
      ref={viewRef}
      onLayout={measure}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderRadius: 50,
        backgroundColor: colors.surface,
        borderWidth: isHovered ? 2 : 0,
        borderColor: accentColor,
        paddingHorizontal: 16,
        paddingVertical: 10,
      }}
    >
      <MaterialIcons name="inventory-2" size={20} color={colors.text} />
      <Text style={{ fontSize: 16 }}>Backlog</Text>
    </View>
  );
}

function HeaderIconButton({
  icon,
  onPress,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MaterialIcons name={icon} size={22} color={colors.text} />
    </Pressable>
  );
}
