/**
 * Settings > Design 의 "Font" 옵션(Sans-Serif/Serif/Mono/Dyslexia)을 실제
 * 로드된 폰트 패밀리에 매핑한다. 폰의 시스템 폰트 설정과 무관하게 앱이
 * 직접 폰트를 번들해서 항상 동일하게 보이도록 한다.
 *
 * "Dyslexia" 옵션은 실제 난독증 전용 폰트(OpenDyslexic 등)가 Google
 * Fonts에 없어서, 가독성 개선을 위해 특별히 디자인된 접근성 폰트인
 * Atkinson Hyperlegible(Braille Institute 제작)로 대체했다.
 */
import {
  Inter_400Regular,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Lora_400Regular,
  Lora_700Bold,
} from '@expo-google-fonts/lora';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_700Bold,
} from '@expo-google-fonts/atkinson-hyperlegible';
import type { AppFont } from './palettes';

export const FONTS_TO_LOAD = {
  Inter_400Regular,
  Inter_700Bold,
  Lora_400Regular,
  Lora_700Bold,
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_700Bold,
};

const FONT_FAMILIES: Record<AppFont, { regular: string; bold: string }> = {
  SANS_SERIF: { regular: 'Inter_400Regular', bold: 'Inter_700Bold' },
  SERIF: { regular: 'Lora_400Regular', bold: 'Lora_700Bold' },
  MONO: { regular: 'JetBrainsMono_400Regular', bold: 'JetBrainsMono_700Bold' },
  DYSLEXIA: { regular: 'AtkinsonHyperlegible_400Regular', bold: 'AtkinsonHyperlegible_700Bold' },
};

export function resolveFontFamily(font: AppFont, bold: boolean): string {
  const pair = FONT_FAMILIES[font] ?? FONT_FAMILIES.SANS_SERIF;
  return bold ? pair.bold : pair.regular;
}
