/**
 * Compose의 ModalBottomSheet 대응. 별도 바텀시트 라이브러리를 추가하는 대신
 * 이미 설치된 Reanimated로 슬라이드업 + 배경 탭 시 닫힘만 구현한 최소 버전.
 * (스냅 포인트, 드래그로 닫기 등은 원본에도 커스텀 동작이 확인되지 않아 미구현)
 */
import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export function BottomSheet({
  visible,
  onDismiss,
  children,
}: {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, { duration: 220 });
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value * 0.5 }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * 400 }],
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss}>
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
        </Animated.View>
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <SafeAreaView edges={['bottom']}>{children}</SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});
