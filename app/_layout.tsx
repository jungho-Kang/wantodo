import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Image, StatusBar, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { runOnJS } from "react-native-worklets";
import { getDb } from "../src/db/client";
import { syncReminderNotifications } from "../src/lib/notifications";
import { useSettingsStore } from "../src/store/settingsStore";
import { FONTS_TO_LOAD } from "../src/theme/fonts";
import { useThemeColors } from "../src/theme/useThemeColors";

const LOADING_BAR_TRACK_WIDTH = 220;

/** 디자인 시안 하단의 가는 선 자리에 실제로 동작하는 로딩 바를 그린다. */
function LoadingBar({
  appReady,
  onFillComplete,
}: {
  appReady: boolean;
  onFillComplete: () => void;
}) {
  const progress = useSharedValue(0);
  const [barDone, setBarDone] = useState(false);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 1200 }, (finished) => {
      if (finished) runOnJS(setBarDone)(true);
    });
  }, []);

  useEffect(() => {
    if (appReady && barDone) {
      onFillComplete();
    }
  }, [appReady, barDone]);

  const style = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View
      style={{
        position: "absolute",
        bottom: "8%",
        alignSelf: "center",
        width: LOADING_BAR_TRACK_WIDTH,
        height: 3,
        borderRadius: 2,
        backgroundColor: "rgba(240, 236, 220, 0.25)",
        overflow: "hidden",
      }}
    >
      <Animated.View
        style={[
          {
            height: 3,
            borderRadius: 2,
            backgroundColor: "#F0ECDC",
          },
          style,
        ]}
      />
    </View>
  );
}

/**
 * 안드로이드 12+의 네이티브 스플래시 API는 무조건 작은 중앙 아이콘 +
 * 배경색으로만 표시되도록 OS 차원에서 강제되어 있어서(resizeMode 설정과
 * 무관), 디자인한 전체 화면 스플래시 이미지를 그대로 보여줄 수 없다.
 * 그래서 네이티브 스플래시는 최대한 빨리 숨기고, 그 자리를 이 컴포넌트가
 * 이어받아 전체 화면 이미지를 직접 그린다 (폰트 로딩 등 준비가 끝나면
 * 실제 화면으로 전환). 디자인 시안의 하단 선 자리에는 실제로 움직이는
 * 로딩 바를 겹쳐 그린다.
 */
function CustomSplash({
  appReady,
  onFinish,
}: {
  appReady: boolean;
  onFinish: () => void;
}) {
  return (
    <View style={{ flex: 1 }}>
      <Image
        source={require("../assets/splash-screen.png")}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
      />
      <LoadingBar appReady={appReady} onFillComplete={onFinish} />
    </View>
  );
}

// 아래 CustomSplash가 대신 그리기 시작할 때까지만 네이티브 스플래시를 띄워둔다.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const weeklyReminderEnabled = useSettingsStore(
    (s) => s.weeklyReminderEnabled,
  );
  const eveningReminderEnabled = useSettingsStore(
    (s) => s.eveningReminderEnabled,
  );
  const { isDark, background } = useThemeColors();
  const [fontsLoaded] = useFonts(FONTS_TO_LOAD);
  const [dbReady, setDbReady] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    // Room(AppDatabase.kt) 대응: 앱 시작 시 SQLite 테이블을 보장한다.
    getDb();
    setDbReady(true);
  }, []);

  // 네이티브 스플래시는 CustomSplash가 첫 프레임을 그릴 기회를 준 뒤 곧바로
  // 숨긴다 - 예전에는 CustomSplash의 <Image onLoadEnd>에서만 숨겼는데,
  // 폰트 로딩(fontsLoaded)이 이미지 로딩보다 먼저 끝나버리면(느린 tunnel
  // 연결 등에서 실제로 발생) CustomSplash가 onLoadEnd 호출 전에 언마운트돼
  // hideAsync()가 영영 호출되지 않고 네이티브 스플래시가 무한히 떠있는
  // 버그가 있었다 - 마운트 시점에 한 번만, 무조건 호출하도록 분리함.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      SplashScreen.hideAsync();
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Settings > General 토글이 바뀔 때마다(+ 영속화 복원 후 최초 1회) 실제
  // 예약된 알림과 동기화한다.
  useEffect(() => {
    syncReminderNotifications({
      weeklyReminderEnabled,
      eveningReminderEnabled,
    });
  }, [weeklyReminderEnabled, eveningReminderEnabled]);

  const appReady = fontsLoaded && dbReady;

  if (!splashFinished) {
    return (
      <CustomSplash
        appReady={appReady}
        onFinish={() => setSplashFinished(true)}
      />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={background}
        />
        <Stack
          screenOptions={{ contentStyle: { backgroundColor: background } }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="focus"
            options={{ presentation: "fullScreenModal", headerShown: false }}
          />
          <Stack.Screen
            name="statistics"
            options={{ presentation: "modal", headerShown: false }}
          />
          <Stack.Screen
            name="weekly-reset"
            options={{ presentation: "fullScreenModal", headerShown: false }}
          />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
