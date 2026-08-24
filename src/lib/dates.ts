/**
 * 날짜 유틸. 원본 Kotlin 코드는 java.time.LocalDate('YYYY-MM-DD')를 쓰므로,
 * RN 쪽에서도 Date 객체 대신 'YYYY-MM-DD' 문자열을 기본 표현으로 다룬다
 * (DB/스토어 전체에서 동일 — src/db/schema.ts 참고).
 */
import { addDays, format, parseISO, startOfWeek } from 'date-fns';

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function todayISODate(): string {
  return toISODate(new Date());
}

export function fromISODate(iso: string): Date {
  return parseISO(iso);
}

/**
 * 원본: HomeViewModel.kt `weekDatesFor()`
 * (date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)), 이후 6일)
 */
export function weekDatesFor(iso: string): string[] {
  const monday = startOfWeek(fromISODate(iso), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => toISODate(addDays(monday, i)));
}

export function addDaysISO(iso: string, amount: number): string {
  return toISODate(addDays(fromISODate(iso), amount));
}
