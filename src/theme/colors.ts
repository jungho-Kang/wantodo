/**
 * 색상 정의. "Forest" 팔레트를 기본값으로 사용.
 * 정확한 Hex 값은 아직 실측하지 않았으므로 [ESTIMATED] 로 근접치를 사용한다.
 * 추후 스포이드로 정확한 값 재확인 필요.
 */

// [ESTIMATED] Forest 팔레트 5색 (스크린샷 육안 추정)
export const AccentTeal = '#2F5D50';
export const OliveGreen = '#8FA47A';
export const SageGreen = '#7C9470';
export const LightSage = '#A9B896';
export const Olive = '#C7C79E';

// Light Mode 기본 배경/서피스 (Master Spec 4.5, 10.1)
export const LightBackground = '#F3F1F5'; // Off-white
export const LightSurface = '#FFFFFF';
export const LightSurfaceCard = '#F7F5F9';

// Delete / Red UI
export const DeleteRed = '#E0453C';

// Accent (Archive 체크박스 등, Master Spec 9.3)
export const AccentColor = AccentTeal;

// Dark Mode - [ESTIMATED], 아직 실측 안 됨
export const DarkBackground = '#15161B';
export const DarkSurface = '#1D1E24';
export const DarkSurfaceCard = '#23252C';
export const DarkSurfaceElevated = '#2A2C34';

export const LightColors = {
  primary: AccentTeal,
  secondary: OliveGreen,
  background: LightBackground,
  surface: LightSurfaceCard,
  error: DeleteRed,
};

export const DarkColors = {
  primary: AccentTeal,
  secondary: OliveGreen,
  background: DarkBackground,
  surface: DarkSurfaceCard,
  error: DeleteRed,
};

/** '#RRGGBB' 색상에 alpha(0~1)를 적용한 rgba() 문자열을 반환한다. */
export function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * 임의의 '#RRGGBB' 배경색 위에서 읽기 좋은 텍스트 색(검정/흰색)을 고른다.
 * Design에서 팔레트를 바꾸면 요일 탭 배경색도 같이 바뀌는데, 앱 자체의
 * 라이트/다크 모드와 무관하게 그 배경색 자체의 밝기에 맞춰 글자색을
 * 정해야 항상 읽힌다 (예: Monochrom 팔레트의 어두운 요일 칸).
 */
export function getContrastTextColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#000000' : '#FFFFFF';
}
