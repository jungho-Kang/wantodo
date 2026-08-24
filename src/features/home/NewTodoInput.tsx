/**
 * 원본: ui/home/NewTodoInput.kt (Master Spec 4.7)
 * 등록 후에도 키보드를 유지하고 입력창을 초기화해 연속 입력이 가능하도록 한다.
 */
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LightSurfaceCard } from '../../theme/colors';

export function NewTodoInput({
  onSubmit,
  placeholder = 'New todo...',
}: {
  onSubmit: (title: string) => void;
  placeholder?: string;
}) {
  const [text, setText] = useState('');

  function submit() {
    const trimmed = text.trim();
    if (trimmed) {
      onSubmit(trimmed);
      setText(''); // 등록 후 초기화, 키보드는 유지됨
    }
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16 }}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        onSubmitEditing={submit}
        returnKeyType="done"
        style={{
          flex: 1,
          backgroundColor: LightSurfaceCard,
          borderRadius: 28,
          paddingHorizontal: 16,
          paddingVertical: 12,
          fontSize: 16,
        }}
      />
      <Pressable
        onPress={submit}
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: '#000',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialIcons name="add" size={24} color="#fff" />
      </Pressable>
    </View>
  );
}
