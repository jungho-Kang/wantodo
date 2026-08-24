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

// Right Swipe 화살표 색 - [CONFIRMED] Teal 아님, 옅은 노란/올리브 계열
// 실측 RGB 약 (240, 236, 220) - Master Spec 5.1절 참고
export const RightSwipeArrow = '#F0ECDC';

// Delete / Red UI
export const DeleteRed = '#E0453C';

// Accent (Archive 체크박스 등, Master Spec 9.3)
export const AccentColor = AccentTeal;

// Dark Mode - [ESTIMATED], 아직 실측 안 됨
export const DarkBackground = '#15161B';
export const DarkSurfaceCard = '#23252C';

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
