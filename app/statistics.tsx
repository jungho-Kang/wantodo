/**
 * 원본: ui/statistics/StatisticsBottomSheet.kt (Master Spec 3번, 9번)
 * Home의 Greeting 아래 보조 문구를 탭하면 열린다 (원본은 ModalBottomSheet,
 * RN은 _layout.tsx의 modal 라우트로 대체 — 기능은 동일).
 */
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BacklogTab } from '../src/features/statistics/BacklogTab';
import { ActivityTab } from '../src/features/statistics/ActivityTab';
import { ArchiveTab } from '../src/features/statistics/ArchiveTab';
import { AccentTeal } from '../src/theme/colors';

type StatsTab = 'BACKLOG' | 'ACTIVITY' | 'ARCHIVE';
const TABS: StatsTab[] = ['BACKLOG', 'ACTIVITY', 'ARCHIVE'];

export default function StatisticsScreen() {
  const [tab, setTab] = useState<StatsTab>('BACKLOG');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee' }}>
        {TABS.map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={{ flex: 1, alignItems: 'center', paddingVertical: 14 }}
          >
            <Text style={{ fontWeight: tab === t ? '700' : '400', color: tab === t ? AccentTeal : '#000' }}>{t}</Text>
            {tab === t && (
              <View style={{ height: 2, backgroundColor: AccentTeal, width: '60%', marginTop: 6, borderRadius: 1 }} />
            )}
          </Pressable>
        ))}
      </View>

      <View style={{ flex: 1 }}>
        {tab === 'BACKLOG' && <BacklogTab />}
        {tab === 'ACTIVITY' && <ActivityTab />}
        {tab === 'ARCHIVE' && <ArchiveTab />}
      </View>
    </SafeAreaView>
  );
}
