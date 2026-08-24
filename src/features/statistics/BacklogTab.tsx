/**
 * 원본: ui/statistics/StatisticsBottomSheet.kt 의 private BacklogTab (Master Spec 9.1)
 * 이미 있던 taskStore.backlog/loadBacklog을 재사용한다.
 */
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTaskStore } from '../../store/taskStore';
import * as taskQueries from '../../db/taskQueries';
import { LightSurfaceCard } from '../../theme/colors';

export function BacklogTab() {
  const backlog = useTaskStore((s) => s.backlog);
  const loadBacklog = useTaskStore((s) => s.loadBacklog);
  const [text, setText] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadBacklog();
    }, [])
  );

  async function submit() {
    const title = text.trim();
    if (!title) return;
    await taskQueries.insertTask({
      title,
      note: null,
      date: null,
      isCompleted: false,
      isTopTask: false,
      isRoutine: false,
    });
    setText('');
    loadBacklog();
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {backlog.length === 0 ? (
          <View style={{ paddingVertical: 48, alignItems: 'center', gap: 8 }}>
            <MaterialIcons name="inventory-2" size={24} color="rgba(0,0,0,0.3)" />
            <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.5)' }}>No tasks in backlog</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
            {backlog.map((task) => (
              <View
                key={task.id}
                style={{
                  backgroundColor: LightSurfaceCard,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <Text style={{ fontSize: 16 }}>{task.title}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16 }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="New task..."
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
    </View>
  );
}
