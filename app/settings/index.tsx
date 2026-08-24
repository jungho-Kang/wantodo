/**
 * 원본: ui/settings/SettingsMainScreen.kt (Master Spec 10.1 갱신 - 실기기 확인)
 *
 * 실제 구조는 4개의 단순 카테고리가 아니라 3개 섹션:
 * - ACCOUNT: 계정 카드가 메인 화면에 바로 노출됨 (하위 메뉴 아님).
 *   로그인 안 된 경우의 정확한 UI는 [UNKNOWN] - "Tap to sign in" 안내만 표시.
 * - APP: General / Design / Wishlist / Changelog / About this app
 * - LEGAL: Imprint / Privacy / Terms of Use
 */
import { ScrollView, Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { useSettingsStore } from '../../src/store/settingsStore';
import { AccentTeal } from '../../src/theme/colors';

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
      <Text style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>{title}</Text>
      <View style={{ backgroundColor: '#F7F5F9', borderRadius: 12 }}>{children}</View>
    </View>
  );
}

function NavRow({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href as any} asChild>
      <Pressable style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 14 }}>
        <Text>{label}</Text>
        <Text style={{ color: '#999' }}>{'>'}</Text>
      </Pressable>
    </Link>
  );
}

export default function SettingsMainScreen() {
  const cloudSyncEnabled = useSettingsStore((s) => s.cloudSyncEnabled);
  const userName = useSettingsStore((s) => s.userName);
  const initial = userName.trim().charAt(0).toUpperCase() || '?';
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <SettingsCard title="ACCOUNT">
        <Link href="/settings/account" asChild>
          <Pressable style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: AccentTeal, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>{initial}</Text>
            </View>
            {cloudSyncEnabled ? (
              <View>
                <Text style={{ fontWeight: 'bold' }}>{userName || 'Account'}</Text>
                <Text style={{ color: AccentTeal, fontSize: 12 }}>Synced</Text>
              </View>
            ) : (
              // [UNKNOWN] 로그인 전 정확한 UI 미확인 - "Tap to sign in" 안내만 표시
              <Text style={{ fontWeight: 'bold' }}>Tap to sign in</Text>
            )}
          </Pressable>
        </Link>
      </SettingsCard>

      <SettingsCard title="APP">
        <NavRow label="General" href="/settings/general" />
        <NavRow label="Design" href="/settings/design" />
        <NavRow label="Wishlist" href="/settings/wishlist" />
        <NavRow label="Changelog" href="/settings/unconfirmed?topic=changelog" />
        <NavRow label="About this app" href="/settings/unconfirmed?topic=about" />
      </SettingsCard>

      <SettingsCard title="LEGAL">
        <NavRow label="Imprint" href="/settings/unconfirmed?topic=imprint" />
        <NavRow label="Privacy" href="/settings/unconfirmed?topic=privacy" />
        <NavRow label="Terms of Use" href="/settings/unconfirmed?topic=terms" />
      </SettingsCard>
    </ScrollView>
  );
}
