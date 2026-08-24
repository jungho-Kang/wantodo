/**
 * 원본: ui/settings/CustomPaletteScreen.kt 의 private PickColorBottomSheet
 * (Master Spec 10.3, 실기기 확인)
 *
 * 실제 2D 채도/명도 그라디언트 조작 없이 미리보기 박스로 단순화됨 - 실제
 * 색 선택은 Hex 입력과 Suggestions/From this palette로 이루어진다.
 */
import { useEffect, useState } from 'react';
import { Dimensions, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { BottomSheet } from '../BottomSheet';
import { AccentTeal } from '../../theme/colors';

const MAX_SHEET_HEIGHT = Dimensions.get('window').height * 0.85;

// [ESTIMATED] 추천 색상 16개 - 실기기 확인, 정확한 Hex 값은 육안 추정치
const SUGGESTION_COLORS = [
  '#2F5D50', '#6B9E78', '#A9B896', '#D8D3A8',
  '#E0453C', '#E79BA3', '#E8A98B', '#E3CB3B',
  '#3C7DA6', '#2FB6C4', '#1B2A6B', '#F0F0F0',
  '#B8C0CC', '#8A8A8A', '#2A2A2A', '#000000',
];

function isValidHex(hex: string): boolean {
  return /^[0-9A-F]{6}$/.test(hex);
}

export function PickColorBottomSheet({
  visible,
  initialColor,
  paletteColors,
  onDone,
  onCancel,
}: {
  visible: boolean;
  initialColor: string;
  paletteColors: string[];
  onDone: (color: string) => void;
  onCancel: () => void;
}) {
  const [current, setCurrent] = useState(initialColor);
  const [hexText, setHexText] = useState(initialColor.replace('#', '').toUpperCase());

  useEffect(() => {
    if (visible) {
      setCurrent(initialColor);
      setHexText(initialColor.replace('#', '').toUpperCase());
    }
  }, [visible, initialColor]);

  function handleHexChange(input: string) {
    const cleaned = input.toUpperCase().replace(/[^0-9A-F]/g, '').slice(0, 6);
    setHexText(cleaned);
    if (isValidHex(cleaned)) setCurrent(`#${cleaned}`);
  }

  function selectColor(color: string) {
    setCurrent(color);
    setHexText(color.replace('#', '').toUpperCase());
  }

  return (
    <BottomSheet visible={visible} onDismiss={onCancel}>
      <ScrollView style={{ maxHeight: MAX_SHEET_HEIGHT }} contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Pick color</Text>
        <View style={{ height: 16 }} />

        <View style={{ height: 140, borderRadius: 12, backgroundColor: current }} />

        <View style={{ height: 16 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: current }} />
          <View style={{ width: 12 }} />
          <Text style={{ fontSize: 20 }}>#</Text>
          <TextInput
            value={hexText}
            onChangeText={handleHexChange}
            autoCapitalize="characters"
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 8,
              padding: 10,
              marginLeft: 8,
              fontSize: 16,
            }}
          />
        </View>

        {paletteColors.length > 0 && (
          <>
            <View style={{ height: 16 }} />
            <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>FROM THIS PALETTE</Text>
            <View style={{ height: 8 }} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {paletteColors.map((color, i) => (
                <SwatchDot key={`${color}-${i}`} color={color} onPress={() => selectColor(color)} />
              ))}
            </View>
          </>
        )}

        <View style={{ height: 16 }} />
        <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>SUGGESTIONS</Text>
        <View style={{ height: 8 }} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {SUGGESTION_COLORS.map((color) => (
            <SwatchDot key={color} color={color} onPress={() => selectColor(color)} />
          ))}
        </View>

        <View style={{ height: 20 }} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable
            onPress={onCancel}
            style={{
              flex: 1,
              height: 48,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#ccc',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={() => onDone(current)}
            style={{
              flex: 1,
              height: 48,
              borderRadius: 8,
              backgroundColor: AccentTeal,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Done</Text>
          </Pressable>
        </View>
        <View style={{ height: 12 }} />
      </ScrollView>
    </BottomSheet>
  );
}

function SwatchDot({ color, onPress }: { color: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: color }}
    />
  );
}
