/**
 * 원본: ui/components/NoteBottomSheet.kt (Master Spec 4.6)
 * Note 상세/편집 Bottom Sheet.
 * 구성: 좌측 상단 Task 제목 / 우측 상단 Edit-Save 토글 / Divider / Note 내용.
 * Edit 모드 진입 시 텍스트 영역에 얇은 흰색 Border.
 */
import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { BottomSheet } from './BottomSheet';

interface Props {
  visible: boolean;
  taskTitle: string;
  initialNote: string;
  onSave: (note: string) => void;
  onDismiss: () => void;
}

export function NoteBottomSheet({ visible, taskTitle, initialNote, onSave, onDismiss }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [noteText, setNoteText] = useState(initialNote);

  useEffect(() => {
    if (visible) {
      setNoteText(initialNote);
      setIsEditing(false);
    }
  }, [visible, initialNote]);

  return (
    <BottomSheet visible={visible} onDismiss={onDismiss}>
      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{taskTitle}</Text>
          <Pressable
            onPress={() => {
              if (isEditing) onSave(noteText);
              setIsEditing(!isEditing);
            }}
          >
            <Text style={{ color: '#2F5D50', fontWeight: '600' }}>{isEditing ? 'Save' : 'Edit'}</Text>
          </Pressable>
        </View>

        <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 12 }} />

        {isEditing ? (
          <TextInput
            value={noteText}
            onChangeText={setNoteText}
            placeholder="Add note..."
            multiline
            style={{
              minHeight: 120,
              borderWidth: 1,
              borderColor: '#fff',
              backgroundColor: '#fafafa',
              borderRadius: 8,
              padding: 12,
              textAlignVertical: 'top',
            }}
          />
        ) : (
          <Text style={{ minHeight: 120, fontSize: 16 }}>{noteText}</Text>
        )}
      </View>
    </BottomSheet>
  );
}
