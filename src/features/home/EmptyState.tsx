/**
 * 원본: ui/home/EmptyState.kt (Master Spec 4.8)
 * 원형 체크 아이콘(낮은 opacity) + "No todos for this day"
 */
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export function EmptyState() {
  return (
    <View style={{ paddingVertical: 64, alignItems: 'center', gap: 8 }}>
      <MaterialIcons name="check-circle-outline" size={48} color="rgba(0,0,0,0.2)" />
      <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.5)' }}>No todos for this day</Text>
    </View>
  );
}
