/**
 * react-native의 Text를 대체하는 앱 전용 Text. Settings > Design의 Font
 * 선택값에 맞는 fontFamily를 자동으로 적용한다 (기존 코드는 import 경로만
 * 바꾸면 되고, style={{fontWeight: 'bold'}} 등은 그대로 동작).
 *
 * 커스텀 폰트 파일은 굵기별로 별도 파일(Regular/Bold)이라, fontWeight를
 * 보고 알맞은 파일을 고른 뒤 OS가 또 합성 볼드를 시도하지 않도록
 * fontWeight 자체는 'normal'로 덮어쓴다.
 */
import { Text as RNText, StyleSheet, type TextProps, type TextStyle } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import { resolveFontFamily } from '../theme/fonts';
import { useThemeColors } from '../theme/useThemeColors';

function isBold(fontWeight: TextStyle['fontWeight']): boolean {
  if (fontWeight === 'bold') return true;
  if (typeof fontWeight === 'string') {
    const numeric = parseInt(fontWeight, 10);
    return !Number.isNaN(numeric) && numeric >= 600;
  }
  return false;
}

export function Text({ style, ...props }: TextProps) {
  const font = useSettingsStore((s) => s.font);
  const { text } = useThemeColors();
  const flat = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  const fontFamily = resolveFontFamily(font, isBold(flat.fontWeight));

  return <RNText {...props} style={[{ color: text }, style, { fontFamily, fontWeight: 'normal' }]} />;
}
