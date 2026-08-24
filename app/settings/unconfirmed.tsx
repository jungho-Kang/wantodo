/**
 * 원본: ui/settings/UnconfirmedContentScreen.kt
 * Changelog / About this app / Imprint / Privacy / Terms of Use 공용 화면.
 * [UNKNOWN] 원본 내용을 확인 못해 "Content not yet confirmed" 로 정직하게 표시.
 */
import { View } from 'react-native';
import { Text } from '../../src/components/Text';
import { useLocalSearchParams } from 'expo-router';
import { useThemeColors } from '../../src/theme/useThemeColors';

const TITLES: Record<string, string> = {
  changelog: 'Changelog',
  about: 'About this app',
  imprint: 'Imprint',
  privacy: 'Privacy',
  terms: 'Terms of Use',
};

export default function UnconfirmedContentScreen() {
  const { topic } = useLocalSearchParams<{ topic: string }>();
  const title = TITLES[topic ?? ''] ?? 'Settings';
  const theme = useThemeColors();

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>{title}</Text>
      <Text style={{ color: theme.textTertiary }}>Content not yet confirmed</Text>
    </View>
  );
}
