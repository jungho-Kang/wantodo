/**
 * 원본: ui/settings/DesignScreen.kt (Master Spec 10.1, 10.2, 10.4)
 * Appearance(System/Light/Dark) / Color Palette(9종+Custom) / Font(4종)
 */
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useThemeColors } from '../../src/theme/useThemeColors';
import { presetPalettes, APP_FONTS } from '../../src/theme/palettes';
import {
  SettingsCard,
  SettingsRadioRow,
  PaletteRow,
  SettingsNavRow,
  HorizontalDividerInset,
} from '../../src/components/settings/SettingsComponents';
import type { AppearanceMode } from '../../src/theme/palettes';

const APPEARANCE_OPTIONS: { mode: AppearanceMode; label: string }[] = [
  { mode: 'SYSTEM', label: 'System' },
  { mode: 'LIGHT', label: 'Light' },
  { mode: 'DARK', label: 'Dark' },
];

export default function DesignScreen() {
  const s = useSettingsStore();
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const allPalettes = [...presetPalettes, ...s.customPalettes];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ paddingVertical: 8, paddingBottom: insets.bottom + 24 }}
    >
      <SettingsCard title="APPEARANCE">
        {APPEARANCE_OPTIONS.map((opt, i) => (
          <View key={opt.mode}>
            <SettingsRadioRow
              label={opt.label}
              selected={s.appearance === opt.mode}
              onPress={() => s.setAppearance(opt.mode)}
            />
            {i !== APPEARANCE_OPTIONS.length - 1 && <HorizontalDividerInset />}
          </View>
        ))}
      </SettingsCard>

      <SettingsCard title="COLOR PALETTE">
        {allPalettes.map((palette) => (
          <View key={palette.name}>
            <PaletteRow
              palette={palette}
              selected={s.selectedPaletteName === palette.name}
              onPress={() => s.selectPalette(palette.name)}
            />
            <HorizontalDividerInset />
          </View>
        ))}
        <SettingsNavRow label="+ Custom palette" onPress={() => router.push('/settings/custom-palette')} />
      </SettingsCard>

      <SettingsCard title="FONT">
        {APP_FONTS.map((font, i) => (
          <View key={font.id}>
            <SettingsRadioRow
              label={font.displayName}
              selected={s.font === font.id}
              onPress={() => s.setFont(font.id)}
            />
            {i !== APP_FONTS.length - 1 && <HorizontalDividerInset />}
          </View>
        ))}
      </SettingsCard>
    </ScrollView>
  );
}
