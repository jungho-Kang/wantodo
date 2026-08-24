/**
 * 원본: ui/settings/AccountScreen.kt (Master Spec 10.8)
 * "Enable cloud sync" 토글, Google/Apple 로그인 버튼. 연동 시 "Synced"
 * 초록 텍스트. 실제 로그인 플로우/서버 동기화 로직은 [UNKNOWN] - 버튼만
 * 두고 클릭 시 실제 동작(OAuth 등)은 다음 단계 TODO.
 */
import { Pressable, ScrollView } from 'react-native';
import { Text } from '../../src/components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettingsStore } from '../../src/store/settingsStore';
import { SettingsCard, SettingsToggleRow, HorizontalDividerInset } from '../../src/components/settings/SettingsComponents';
import { useActivePalette } from '../../src/theme/useActivePalette';
import { useThemeColors } from '../../src/theme/useThemeColors';

export default function AccountScreen() {
  const { accentColor } = useActivePalette();
  const theme = useThemeColors();
  const cloudSyncEnabled = useSettingsStore((s) => s.cloudSyncEnabled);
  const setCloudSyncEnabled = useSettingsStore((s) => s.setCloudSyncEnabled);
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ paddingVertical: 8, paddingBottom: insets.bottom + 24 }}
    >
      <SettingsCard>
        <SettingsToggleRow
          label="Enable cloud sync (Todos on all devices)"
          checked={cloudSyncEnabled}
          onCheckedChange={setCloudSyncEnabled}
        />
        {cloudSyncEnabled && (
          <>
            <HorizontalDividerInset />
            <Text style={{ color: accentColor, fontSize: 14, paddingHorizontal: 16, paddingVertical: 12 }}>Synced</Text>
          </>
        )}
      </SettingsCard>

      {!cloudSyncEnabled && (
        <SettingsCard>
          <Pressable
            onPress={() => {
              // TODO: Google 로그인 - 실제 OAuth 플로우 [UNKNOWN]
            }}
            style={{ margin: 16, height: 48, borderRadius: 8, backgroundColor: accentColor, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Continue with Google</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              // TODO: Apple 로그인 - 실제 OAuth 플로우 [UNKNOWN]
            }}
            style={{ marginHorizontal: 16, marginBottom: 16, height: 48, borderRadius: 8, borderWidth: 1, borderColor: theme.border, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontWeight: '600' }}>Continue with Apple</Text>
          </Pressable>
        </SettingsCard>
      )}
    </ScrollView>
  );
}
