/**
 * 타이포그래피 정의.
 * Master Spec [ESTIMATED] 수치 기준.
 * Greeting: 약 20~22sp Bold / Subtitle: 약 14sp
 * Date Header 요일: 약 24sp Bold
 * Note: 약 12~13sp
 */
export const Typography = {
  headlineSmall: { fontWeight: 'bold' as const, fontSize: 21 },
  titleLarge: { fontWeight: 'bold' as const, fontSize: 24 },
  bodyMedium: { fontWeight: 'normal' as const, fontSize: 16 },
  bodySmall: { fontWeight: 'normal' as const, fontSize: 14 },
  labelSmall: { fontWeight: 'normal' as const, fontSize: 12 },
};
