/**
 * 원본: ui/settings/CustomPaletteScreen.kt (Master Spec 10.3, 실기기 확인)
 * NAME 입력 -> COLORS(7요일) -> ACCENT COLOR -> PREVIEW -> Save.
 * 각 요일/Accent 행을 누르면 Pick Color Bottom Sheet가 열린다.
 *
 * 헤더가 Cancel/Save 텍스트 버튼 형태라 settings/_layout.tsx에서 이
 * 라우트만 네이티브 헤더를 끄고 자체 헤더를 그린다.
 */
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSettingsStore } from '../../src/store/settingsStore';
import { SettingsCard, HorizontalDividerInset } from '../../src/components/settings/SettingsComponents';
import { PickColorBottomSheet } from '../../src/components/settings/PickColorBottomSheet';

const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DEFAULT_GRAY = '#9E9E9E';

export default function CustomPaletteScreen() {
  const insets = useSafeAreaInsets();
  const addCustomPalette = useSettingsStore((s) => s.addCustomPalette);
  const [name, setName] = useState('');
  const [dayColors, setDayColors] = useState<string[]>(Array(7).fill(DEFAULT_GRAY));
  const [accentColor, setAccentColor] = useState(DEFAULT_GRAY);
  const [pickerTarget, setPickerTarget] = useState<number | null>(null); // 0~6 = day index, 7 = accent
  const isPickingAccent = pickerTarget === 7;
  const isPickingDay = pickerTarget !== null && pickerTarget < 7;

  const usedColors = useMemo(() => Array.from(new Set([...dayColors, accentColor])), [dayColors, accentColor]);

  function handleSave() {
    if (!name.trim()) return;
    addCustomPalette({ name: name.trim(), colors: dayColors });
    router.back();
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 }}>
        <Pressable onPress={() => router.back()}>
          <Text style={{ fontSize: 16 }}>Cancel</Text>
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Custom palette</Text>
        <Pressable onPress={handleSave} disabled={!name.trim()}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: name.trim() ? '#2F5D50' : '#ccc' }}>Save</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <SettingsCard title="NAME">
          <View style={{ padding: 12 }}>
            <TextInput
              value={name}
              onChangeText={(v) => v.length <= 30 && setName(v)}
              placeholder="e.g. Spring"
              style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 16 }}
            />
            <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', textAlign: 'right', marginTop: 4 }}>
              {name.length}/30
            </Text>
          </View>
        </SettingsCard>

        <SettingsCard title="COLORS">
          {DAY_LABELS.map((label, i) => (
            <View key={label}>
              <ColorPickRow label={label} color={dayColors[i]} onPress={() => setPickerTarget(i)} />
              {i !== DAY_LABELS.length - 1 && <HorizontalDividerInset />}
            </View>
          ))}
        </SettingsCard>

        <SettingsCard title="ACCENT COLOR">
          <ColorPickRow label="Accent" color={accentColor} onPress={() => setPickerTarget(7)} />
        </SettingsCard>

        <SettingsCard title="PREVIEW">
          <View style={{ flexDirection: 'row', gap: 6, padding: 12 }}>
            {dayColors.map((color, i) => (
              <View key={i} style={{ flex: 1, height: 40, borderRadius: 8, backgroundColor: color }} />
            ))}
          </View>
        </SettingsCard>
      </ScrollView>

      <PickColorBottomSheet
        visible={isPickingDay}
        initialColor={pickerTarget !== null && pickerTarget < 7 ? dayColors[pickerTarget] : DEFAULT_GRAY}
        paletteColors={usedColors}
        onDone={(color) => {
          if (pickerTarget !== null && pickerTarget < 7) {
            setDayColors((prev) => prev.map((c, i) => (i === pickerTarget ? color : c)));
          }
          setPickerTarget(null);
        }}
        onCancel={() => setPickerTarget(null)}
      />
      <PickColorBottomSheet
        visible={isPickingAccent}
        initialColor={accentColor}
        paletteColors={usedColors}
        onDone={(color) => {
          setAccentColor(color);
          setPickerTarget(null);
        }}
        onCancel={() => setPickerTarget(null)}
      />
    </View>
  );
}

function ColorPickRow({ label, color, onPress }: { label: string; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
      <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: color }} />
      <Text style={{ fontSize: 16, marginLeft: 12, flex: 1 }}>{label}</Text>
    </Pressable>
  );
}
