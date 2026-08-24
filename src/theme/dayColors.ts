/**
 * 요일별 색상 매핑 — [ESTIMATED] "Forest" 팔레트를 요일별로 임시 매핑한 것.
 */
import { LightSage, Olive, OliveGreen, SageGreen, AccentTeal } from './colors';

/** date-fns getDay(): 0=Sunday .. 6=Saturday */
export const dayColorsBySundayIndex: Record<number, string> = {
  1: Olive, // Monday
  2: LightSage, // Tuesday
  3: SageGreen, // Wednesday
  4: OliveGreen, // Thursday
  5: AccentTeal, // Friday
  6: Olive, // Saturday
  0: LightSage, // Sunday
};
