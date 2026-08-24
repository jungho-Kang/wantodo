/**
 * 색상 팔레트 정의.
 * Master Spec 10.2: 정확히 9개 프리셋 + Custom palette.
 * [ESTIMATED] 각 팔레트의 정확한 Hex 값은 스크린샷 육안 추정치다.
 * 실제 값과 미세하게 다를 수 있으며, 스포이드로 재확인 필요.
 */

export type AppFont = 'SANS_SERIF' | 'SERIF' | 'MONO' | 'DYSLEXIA';

export const APP_FONTS: { id: AppFont; displayName: string }[] = [
  { id: 'SANS_SERIF', displayName: 'Sans-Serif' },
  { id: 'SERIF', displayName: 'Serif' },
  { id: 'MONO', displayName: 'Mono' },
  { id: 'DYSLEXIA', displayName: 'Dyslexia' },
];

export type AppearanceMode = 'SYSTEM' | 'LIGHT' | 'DARK';

export interface ColorPalette {
  name: string;
  colors: string[];
  /** Custom palette에서 별도로 고르는 강조색. Preset은 없으면 colors[0]을 사용한다. */
  accentColor?: string;
}

export const presetPalettes: ColorPalette[] = [
  {
    name: 'Forest',
    colors: ['#2F5D50', '#8FA47A', '#7C9470', '#A9B896', '#C7C79E'],
  },
  {
    name: 'Terracotta',
    colors: ['#C98A3B', '#EDE1C8', '#A9CDE8', '#6FCDA6', '#1A1A1A'],
  },
  {
    name: 'Blossom',
    colors: ['#AAC0AE', '#E8B4A2', '#EFAFC0', '#E0778E', '#A9829C'],
  },
  {
    name: 'Cathode',
    colors: ['#E8792F', '#E23A2E', '#E98868', '#E3CB3B', '#2E9E77'],
  },
  {
    name: 'Bubblegum',
    colors: ['#F0A45C', '#E28B9C', '#E6207E', '#2BA9AE', '#3DDCC6'],
  },
  {
    name: 'Night at the Beach',
    colors: ['#2C1F52', '#6B3F82', '#A680A0', '#CBA57E', '#2E8F72'],
  },
  {
    name: 'Spectral',
    colors: ['#3D0F2B', '#A0286E', '#E0432D', '#EB7A3C', '#F0A24C'],
  },
  {
    name: 'Midnight',
    colors: ['#0E1B33', '#16414A', '#4C7B94', '#AAB6C6', '#E7EAEE'],
  },
  {
    name: 'Monochrom',
    colors: ['#E6E6E6', '#B8B8B8', '#8A8A8A', '#5A5A5A', '#262626'],
  },
];
