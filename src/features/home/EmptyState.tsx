/**
 * 원본: ui/home/EmptyState.kt (Master Spec 4.8)
 * 원형 체크 아이콘(낮은 opacity) + "No todos for this day"
 */
import { View } from 'react-native';
import { Text } from '../../components/Text';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme/useThemeColors';

export function EmptyState() {
  const colors = useThemeColors();
  return (
    <View style={{ paddingVertical: 64, alignItems: 'center', gap: 8 }}>
      <MaterialIcons name="check-circle-outline" size={48} color={colors.textTertiary} />
      <Text style={{ fontSize: 14, color: colors.textSecondary }}>No todos for this day</Text>
    </View>
  );
}
