/**
 * 원본: ui/components/EditTitleBottomSheet.kt
 *
 * Master Spec 자체에는 별도의 "Edit Screen" 상세 UI가 [UNKNOWN]으로
 * 남아있으나, 기능 자체("Todo 제목을 수정할 수 있다")는 [CONFIRMED]다.
 * 화면 디테일을 임의로 꾸미지 않고 최소한의 텍스트 입력 + Save로만
 * 구성한다. 실제 원본 Edit 화면 레이아웃이 확인되면 교체할 것.
 */
import { useEffect, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Text } from './Text';
import { BottomSheet } from './BottomSheet';
import { useActivePalette } from '../theme/useActivePalette';
import { useThemeColors } from '../theme/useThemeColors';

interface Props {
  visible: boolean;
  initialTitle: string;
  onSave: (title: string) => void;
  onDismiss: () => void;
}

export function EditTitleBottomSheet({ visible, initialTitle, onSave, onDismiss }: Props) {
  const { accentColor } = useActivePalette();
  const theme = useThemeColors();
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    if (visible) setTitle(initialTitle);
  }, [visible, initialTitle]);

  return (
    <BottomSheet visible={visible} onDismiss={onDismiss}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Edit task</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={{
            marginTop: 16,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            color: theme.text,
          }}
        />
        <Pressable
          onPress={() => {
            const trimmed = title.trim();
            if (trimmed) {
              onSave(trimmed);
              onDismiss();
            }
          }}
          style={{
            marginTop: 20,
            backgroundColor: accentColor,
            borderRadius: 8,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Save</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
