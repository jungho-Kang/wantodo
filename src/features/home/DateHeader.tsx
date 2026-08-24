/**
 * 원본: ui/home/HomeScreen.kt 의 private DateHeader
 */
import { View } from 'react-native';
import { Text } from '../../components/Text';
import { format } from 'date-fns';
import { fromISODate, todayISODate } from '../../lib/dates';
import { useThemeColors } from '../../theme/useThemeColors';

export function DateHeader({ date }: { date: string }) {
  const colors = useThemeColors();
  const isToday = date === todayISODate();
  const d = fromISODate(date);

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{format(d, 'EEEE')}</Text>
        {isToday && (
          <>
            <View style={{ width: 8 }} />
            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>TODAY</Text>
          </>
        )}
      </View>
      <Text style={{ fontSize: 16 }}>{format(d, 'd. MMMM')}</Text>
      <View style={{ height: 8 }} />
      <View style={{ height: 1, backgroundColor: colors.divider }} />
    </View>
  );
}
