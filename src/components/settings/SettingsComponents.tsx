/**
 * 원본: ui/settings/SettingsComponents.kt (Master Spec 10.3)
 * SettingsTopBar는 포팅하지 않음 - expo-router Stack의 네이티브 헤더가
 * 이미 "뒤로가기+제목" 역할을 한다 (MIGRATION.md 4d번 섹션 참고).
 */
import { Pressable, Switch, View } from 'react-native';
import { Text } from '../Text';
import { MaterialIcons } from '@expo/vector-icons';
import type { ColorPalette } from '../../theme/palettes';
import { useActivePalette } from '../../theme/useActivePalette';
import { useThemeColors } from '../../theme/useThemeColors';

export function SettingsCard({ title, children }: { title?: string; children: React.ReactNode }) {
  const theme = useThemeColors();
  return (
    <View style={{ paddingHorizontal: 20, paddingVertical: 8 }}>
      {title && (
        <>
          <SettingsCategoryLabel title={title} />
          <View style={{ height: 8 }} />
        </>
      )}
      <View style={{ borderRadius: 16, backgroundColor: theme.surface, overflow: 'hidden' }}>{children}</View>
    </View>
  );
}

export function SettingsCategoryLabel({ title }: { title: string }) {
  const { accentColor } = useActivePalette();
  const theme = useThemeColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ width: 3, height: 12, borderRadius: 2, backgroundColor: accentColor }} />
      <View style={{ width: 6 }} />
      <Text style={{ fontSize: 12, color: theme.textSecondary }}>{title}</Text>
    </View>
  );
}

export function SettingsNavRow({
  label,
  trailingText,
  onPress,
}: {
  label: string;
  trailingText?: string;
  onPress: () => void;
}) {
  const theme = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}
    >
      <Text style={{ flex: 1, fontSize: 16 }}>{label}</Text>
      {trailingText && (
        <>
          <Text style={{ fontSize: 14, color: theme.textSecondary }}>{trailingText}</Text>
          <View style={{ width: 4 }} />
        </>
      )}
      <MaterialIcons name="chevron-right" size={20} color={theme.textTertiary} />
    </Pressable>
  );
}

export function SettingsToggleRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  const { accentColor } = useActivePalette();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      <Text style={{ flex: 1, fontSize: 16 }}>{label}</Text>
      <Switch value={checked} onValueChange={onCheckedChange} trackColor={{ true: accentColor }} />
    </View>
  );
}

export function SettingsRadioRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
      }}
    >
      <Text style={{ flex: 1, fontSize: 16 }}>{label}</Text>
      <RadioDot selected={selected} />
    </Pressable>
  );
}

function RadioDot({ selected }: { selected: boolean }) {
  const { accentColor } = useActivePalette();
  const theme = useThemeColors();
  return (
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: selected ? accentColor : theme.textTertiary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {selected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: accentColor }} />}
    </View>
  );
}

export function PaletteRow({
  palette,
  selected,
  onPress,
}: {
  palette: ColorPalette;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}
    >
      <View style={{ flexDirection: 'row' }}>
        {palette.colors.map((color, i) => (
          <View
            key={i}
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: color,
              marginLeft: i === 0 ? 0 : -6,
              borderWidth: 1,
              borderColor: theme.surfaceElevated,
            }}
          />
        ))}
      </View>
      <View style={{ width: 12 }} />
      <Text style={{ flex: 1, fontSize: 16 }}>{palette.name}</Text>
      <RadioDot selected={selected} />
    </Pressable>
  );
}

export function HorizontalDividerInset() {
  const theme = useThemeColors();
  return <View style={{ height: 1, backgroundColor: theme.divider, marginHorizontal: 16 }} />;
}
