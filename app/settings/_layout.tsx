/**
 * 원본: ui/settings/SettingsRoot.kt (스택 기반 내부 네비게이션,
 * 시스템 뒤로가기와 연동). expo-router Stack 이 동일 역할을 한다.
 */
import { Stack } from 'expo-router';
import { useThemeColors } from '../../src/theme/useThemeColors';

export default function SettingsLayout() {
  const { background, surface, text } = useThemeColors();
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: background },
        headerStyle: { backgroundColor: surface },
        headerTintColor: text,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Settings' }} />
      <Stack.Screen name="general" options={{ title: 'General' }} />
      <Stack.Screen name="design" options={{ title: 'Design' }} />
      {/* Cancel/Save 텍스트 헤더를 자체적으로 그리므로 네이티브 헤더는 숨김 */}
      <Stack.Screen name="custom-palette" options={{ headerShown: false }} />
      <Stack.Screen name="wishlist" options={{ title: 'Wishlist' }} />
      <Stack.Screen name="account" options={{ title: 'Account' }} />
      <Stack.Screen name="unconfirmed" options={{ title: '' }} />
    </Stack>
  );
}
