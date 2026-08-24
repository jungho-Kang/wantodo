/**
 * 원본: ui/settings/SettingsViewModel.kt + SettingsRepository.kt + SettingsDataStore.kt
 * (Master Spec 10번)
 *
 * 원본은 DataStore Preferences에 값을 하나씩 저장하고, Custom Palette는
 * 별도 직렬화 라이브러리를 새로 추가하지 않기 위해 "이름|RRGGBB,..."
 * 구분자 문자열로 직접 인코딩했다. RN에서는 zustand의 `persist` +
 * AsyncStorage로 상태 전체를 JSON으로 저장한다 — 저장되는 값(필드)은
 * 원본과 동일하고, 저장 형식만 다르다 (JSON은 RN/JS 환경에 기본 내장돼
 * 있어 원본처럼 커스텀 인코딩을 쓸 이유가 없음).
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppFont, AppearanceMode, ColorPalette } from '../theme/palettes';

interface SettingsState {
  appearance: AppearanceMode;
  selectedPaletteName: string;
  font: AppFont;
  customPalettes: ColorPalette[];
  showWeekend: boolean;
  hapticFeedback: boolean;
  completedToBottom: boolean;
  weeklyReminderEnabled: boolean;
  eveningReminderEnabled: boolean;
  userName: string;
  anonymousUsageStats: boolean;
  cloudSyncEnabled: boolean;

  setAppearance: (mode: AppearanceMode) => void;
  selectPalette: (name: string) => void;
  setFont: (font: AppFont) => void;
  addCustomPalette: (palette: ColorPalette) => void;
  setShowWeekend: (value: boolean) => void;
  setHapticFeedback: (value: boolean) => void;
  setCompletedToBottom: (value: boolean) => void;
  setWeeklyReminderEnabled: (value: boolean) => void;
  setEveningReminderEnabled: (value: boolean) => void;
  setUserName: (name: string) => void;
  setAnonymousUsageStats: (value: boolean) => void;
  setCloudSyncEnabled: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      appearance: 'SYSTEM',
      selectedPaletteName: 'Forest',
      font: 'SANS_SERIF',
      customPalettes: [],
      showWeekend: true,
      hapticFeedback: true,
      completedToBottom: false,
      weeklyReminderEnabled: false,
      eveningReminderEnabled: false,
      userName: 'User',
      anonymousUsageStats: true,
      cloudSyncEnabled: false,

      setAppearance: (mode) => set({ appearance: mode }),
      selectPalette: (name) => set({ selectedPaletteName: name }),
      setFont: (font) => set({ font }),
      addCustomPalette: (palette) =>
        set((state) => ({
          customPalettes: [...state.customPalettes, palette],
          selectedPaletteName: palette.name,
        })),
      setShowWeekend: (value) => set({ showWeekend: value }),
      setHapticFeedback: (value) => set({ hapticFeedback: value }),
      setCompletedToBottom: (value) => set({ completedToBottom: value }),
      setWeeklyReminderEnabled: (value) => set({ weeklyReminderEnabled: value }),
      setEveningReminderEnabled: (value) => set({ eveningReminderEnabled: value }),
      setUserName: (name) => set({ userName: name }),
      setAnonymousUsageStats: (value) => set({ anonymousUsageStats: value }),
      setCloudSyncEnabled: (value) => set({ cloudSyncEnabled: value }),
    }),
    {
      name: 'settings_prefs',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
