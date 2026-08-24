/**
 * Settings > Design 에서 고른 Color Palette를 실제로 화면에 반영하기 위한
 * 훅. 예전엔 selectedPaletteName/customPalettes가 저장만 되고 어디에도
 * 연결이 안 되어 있었음 (Font/Completed to bottom과 같은 유형의 버그) -
 * 사용자 요청으로 실제 적용되게 연결함.
 *
 * Preset 팔레트는 5색만 갖고 있어서 7개 요일에 매핑할 규칙이 필요하다.
 * 기존에 기본 팔레트("Forest")가 하드코딩되어 있던 실제 매핑
 * (월:5번째색 ~ 금:1번째색, 토/일은 다시 순환)을 일반화한 규칙을 모든
 * Preset에 동일하게 적용한다: 월요일부터 색상 배열을 거꾸로 순환.
 * Custom 팔레트는 요일마다 정확히 하나씩(7색) 직접 고른 값이라 그대로 쓴다.
 */
import { useMemo } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { presetPalettes, type ColorPalette } from './palettes';

/** 반환 배열은 월요일(0) ~ 일요일(6) 순서. */
function resolveMondayIndexedColors(colors: string[]): string[] {
  if (colors.length === 0) return presetPalettes[0].colors;
  if (colors.length >= 7) return colors.slice(0, 7);
  const n = colors.length;
  return Array.from({ length: 7 }, (_, mondayIndex) => colors[((n - 1 - mondayIndex) % n + n) % n]);
}

export function useActivePalette() {
  const selectedPaletteName = useSettingsStore((s) => s.selectedPaletteName);
  const customPalettes = useSettingsStore((s) => s.customPalettes);

  return useMemo(() => {
    const all: ColorPalette[] = [...presetPalettes, ...customPalettes];
    const palette = all.find((p) => p.name === selectedPaletteName) ?? presetPalettes[0];
    const monToSun = resolveMondayIndexedColors(palette.colors);

    /** date-fns getDay() 기준(0=Sunday ... 6=Saturday)으로 재배열 */
    const dayColorsBySundayIndex: Record<number, string> = {
      0: monToSun[6],
      1: monToSun[0],
      2: monToSun[1],
      3: monToSun[2],
      4: monToSun[3],
      5: monToSun[4],
      6: monToSun[5],
    };

    const accentColor = palette.accentColor ?? palette.colors[0] ?? presetPalettes[0].colors[0];

    return { palette, dayColorsBySundayIndex, accentColor };
  }, [selectedPaletteName, customPalettes]);
}
