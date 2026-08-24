/**
 * 원본: ui/focus/FocusSessionScreen.kt 의 private TimerWheelPicker (Master Spec 7번)
 *
 * 세로 스크롤 휠 형태의 타이머 선택기. 가운데 항목이 선택값이며 크고
 * 진하게, 나머지는 작고 흐리게 표시된다 (실기기 영상 기준 [CONFIRMED]).
 * 원본은 Compose의 snap fling + derivedStateOf로 가운데 항목을 계산했고,
 * RN은 ScrollView의 네이티브 snapToInterval + onScroll로 동일하게 재현한다.
 */
import { useEffect, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, Text, View } from 'react-native';
import { AccentTeal } from '../../theme/colors';

const TIMER_OPTIONS: (number | null)[] = [null, ...Array.from({ length: 24 }, (_, i) => (i + 1) * 5)];

const ITEM_HEIGHT = 48;
const VISIBLE_ROWS = 3;

export function TimerWheelPicker({
  selected,
  onSelected,
}: {
  selected: number | null;
  onSelected: (minutes: number | null) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const initialIndex = Math.max(0, TIMER_OPTIONS.indexOf(selected));
  const [centeredIndex, setCenteredIndex] = useState(initialIndex);

  useEffect(() => {
    // 초기 위치를 현재 선택값으로 맞춤 (애니메이션 없이)
    scrollRef.current?.scrollTo({ y: initialIndex * ITEM_HEIGHT, animated: false });
  }, []);

  function indexFromOffset(offsetY: number) {
    return Math.round(offsetY / ITEM_HEIGHT);
  }

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = indexFromOffset(e.nativeEvent.contentOffset.y);
    if (index !== centeredIndex && index >= 0 && index < TIMER_OPTIONS.length) {
      setCenteredIndex(index);
    }
  }

  function commit(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.min(Math.max(0, indexFromOffset(e.nativeEvent.contentOffset.y)), TIMER_OPTIONS.length - 1);
    setCenteredIndex(index);
    onSelected(TIMER_OPTIONS[index] ?? null);
  }

  return (
    <View style={{ height: ITEM_HEIGHT * VISIBLE_ROWS, justifyContent: 'center' }}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={commit}
        onScrollEndDrag={commit}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ROWS / 2) }}
      >
        {TIMER_OPTIONS.map((minutes, index) => {
          const isCentered = index === centeredIndex;
          return (
            <View
              key={String(minutes)}
              style={{ height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text
                style={{
                  fontSize: isCentered ? 24 : 16,
                  fontWeight: isCentered ? 'bold' : 'normal',
                  color: isCentered ? AccentTeal : 'rgba(0,0,0,0.35)',
                }}
              >
                {minutes === null ? 'No timer' : `${minutes} min`}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
