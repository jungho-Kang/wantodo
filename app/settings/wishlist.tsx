/**
 * 원본: ui/settings/WishlistScreen.kt (Master Spec 10.6, 실기기 스크린샷 확인)
 * Pending/Planned/Completed 3개 탭(알약 버튼), 카드는 Upvote 박스+제목+
 * 설명+댓글 수, 우측 하단 FAB(+)로 새 요청 등록.
 *
 * [UNKNOWN] 실제 요청 목록 내용, 새 요청 등록 폼, 개별 항목 상세 화면은
 * 미확인 - 목록은 빈 상태로 시작하고 예시 데이터를 지어내지 않는다.
 * FAB는 진입점만 두고 등록 폼은 다음 단계 TODO.
 */
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../src/components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useActivePalette } from '../../src/theme/useActivePalette';
import { useThemeColors } from '../../src/theme/useThemeColors';

type WishlistTab = 'PENDING' | 'PLANNED' | 'COMPLETED';
const TABS: { key: WishlistTab; label: string }[] = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'PLANNED', label: 'Planned' },
  { key: 'COMPLETED', label: 'Completed' },
];

export default function WishlistScreen() {
  const { accentColor } = useActivePalette();
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<WishlistTab>('PENDING');
  // [UNKNOWN] 실제 요청 데이터는 서버 기반일 것으로 추정되나 확인 불가.
  // 원본 내용을 지어내지 않고 빈 목록으로 시작한다.
  const items: never[] = [];

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 12 }}>
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setTab(t.key)}
            style={{
              borderRadius: 50,
              paddingHorizontal: 16,
              paddingVertical: 8,
              backgroundColor: tab === t.key ? accentColor : theme.surface,
            }}
          >
            <Text style={{ color: tab === t.key ? '#fff' : theme.text }}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ height: 16 }} />

      {items.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 48 }}>
          <Text style={{ fontSize: 14, color: theme.textSecondary }}>No feature requests</Text>
        </View>
      ) : null}

      <Pressable
        onPress={() => {
          // TODO: 새 요청 등록 폼 - [UNKNOWN]
        }}
        style={{
          position: 'absolute',
          right: 20,
          bottom: insets.bottom + 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: accentColor,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 4,
        }}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}
