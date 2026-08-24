/**
 * 원본: ui/settings/GeneralScreen.kt (Master Spec 10.5)
 * Your name / Show weekend / Haptic feedback / Completed to bottom /
 * Weekly reminder / Evening reminder / Anonymous usage statistics.
 */
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettingsStore } from '../../src/store/settingsStore';
import { SettingsCard, SettingsToggleRow, HorizontalDividerInset } from '../../src/components/settings/SettingsComponents';
import { AccentTeal } from '../../src/theme/colors';

const NAME_MAX_LENGTH = 20;

/**
 * 평소엔 이름을 텍스트로만 보여주고, "Modify"를 눌러야 편집 모드(입력창+Save)로 전환된다.
 * Home 헤더에 아이콘들과 나란히 표시되므로 길이를 제한한다 (그래도 혹시 모를
 * 경우를 대비해 헤더 쪽에도 말줄임 처리를 이중으로 해둔다).
 */
function NameField({ value, onSave }: { value: string; onSave: (name: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!isEditing) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 16 }} numberOfLines={1} ellipsizeMode="tail">
          {value}
        </Text>
        <Pressable
          onPress={() => {
            setDraft(value);
            setIsEditing(true);
          }}
        >
          <Text style={{ color: AccentTeal, fontWeight: '600' }}>Modify</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          maxLength={NAME_MAX_LENGTH}
          autoFocus
          style={{ flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16 }}
        />
        <Pressable
          onPress={() => {
            const trimmed = draft.trim();
            if (trimmed) onSave(trimmed);
            setIsEditing(false);
          }}
        >
          <Text style={{ color: AccentTeal, fontWeight: '600' }}>Save</Text>
        </Pressable>
      </View>
      <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.4)', textAlign: 'right', marginTop: 4 }}>
        {draft.length}/{NAME_MAX_LENGTH}
      </Text>
    </View>
  );
}

export default function GeneralScreen() {
  const s = useSettingsStore();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={{ paddingVertical: 8, paddingBottom: insets.bottom + 24 }}
    >
      <SettingsCard>
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>Your name</Text>
          <View style={{ height: 8 }} />
          <NameField value={s.userName} onSave={s.setUserName} />
        </View>
      </SettingsCard>

      <SettingsCard>
        <SettingsToggleRow label="Show weekend" checked={s.showWeekend} onCheckedChange={s.setShowWeekend} />
        <HorizontalDividerInset />
        <SettingsToggleRow label="Haptic feedback" checked={s.hapticFeedback} onCheckedChange={s.setHapticFeedback} />
        <HorizontalDividerInset />
        <SettingsToggleRow
          label="Completed to bottom"
          checked={s.completedToBottom}
          onCheckedChange={s.setCompletedToBottom}
        />
      </SettingsCard>

      <SettingsCard>
        <SettingsToggleRow
          label="Weekly reminder"
          checked={s.weeklyReminderEnabled}
          onCheckedChange={s.setWeeklyReminderEnabled}
        />
        <HorizontalDividerInset />
        <SettingsToggleRow
          label="Evening reminder"
          checked={s.eveningReminderEnabled}
          onCheckedChange={s.setEveningReminderEnabled}
        />
      </SettingsCard>

      <SettingsCard>
        <SettingsToggleRow
          label="Anonymous usage statistics"
          checked={s.anonymousUsageStats}
          onCheckedChange={s.setAnonymousUsageStats}
        />
      </SettingsCard>
    </ScrollView>
  );
}
