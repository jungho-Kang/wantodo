/**
 * Light/Dark 모드 semantic 색상 토큰. Settings > Design > Appearance
 * (System/Light/Dark, settingsStore.appearance)에 따라 화면 배경/서피스/
 * 텍스트/보더 색을 통일된 토큰으로 제공한다. 강조색(accentColor)은 별도로
 * useActivePalette()가 담당한다.
 */
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import {
  LightBackground,
  LightSurface,
  LightSurfaceCard,
  DarkBackground,
  DarkSurface,
  DarkSurfaceCard,
  DarkSurfaceElevated,
} from './colors';

export interface ThemeColors {
  isDark: boolean;
  /** 화면 최상위 배경 (구 '#fff') */
  background: string;
  /** 카드/리스트 아이템 배경 (구 '#F7F5F9') */
  surface: string;
  /** 바텀시트, 모달 등 배경 (구 '#fff') */
  surfaceElevated: string;
  /** 기본 텍스트 (구 '#000' / 명시 색 없음) */
  text: string;
  /** 보조 텍스트 (구 rgba(0,0,0,0.5~0.6)) */
  textSecondary: string;
  /** 더 흐린 보조 텍스트 (구 rgba(0,0,0,0.3~0.4), placeholder 등) */
  textTertiary: string;
  /** 입력창/카드 보더 (구 '#ccc' / '#ddd') */
  border: string;
  /** 구분선 (구 '#eee') */
  divider: string;
  /** progress track 등 옅은 배경 (구 '#eee') */
  track: string;
}

const LightTheme: ThemeColors = {
  isDark: false,
  background: LightBackground,
  surface: LightSurfaceCard,
  surfaceElevated: LightSurface,
  text: '#000000',
  textSecondary: 'rgba(0,0,0,0.55)',
  textTertiary: 'rgba(0,0,0,0.35)',
  border: '#cccccc',
  divider: '#eeeeee',
  track: '#eeeeee',
};

const DarkTheme: ThemeColors = {
  isDark: true,
  background: DarkBackground,
  surface: DarkSurfaceCard,
  surfaceElevated: DarkSurfaceElevated,
  text: '#F2F2F2',
  textSecondary: 'rgba(255,255,255,0.6)',
  textTertiary: 'rgba(255,255,255,0.4)',
  border: 'rgba(255,255,255,0.25)',
  divider: 'rgba(255,255,255,0.1)',
  track: DarkSurface,
};

export function useThemeColors(): ThemeColors {
  const appearance = useSettingsStore((s) => s.appearance);
  const systemScheme = useColorScheme();
  const isDark = appearance === 'DARK' || (appearance === 'SYSTEM' && systemScheme === 'dark');
  return useMemo(() => (isDark ? DarkTheme : LightTheme), [isDark]);
}
