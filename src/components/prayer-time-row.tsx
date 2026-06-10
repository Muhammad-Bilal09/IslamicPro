import React from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { ThemedText } from './themed-text';
import { IconButton } from './icon-button';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import Card from './card';

import { Ionicons } from '@expo/vector-icons';

export interface PrayerTimeRowProps {
  name: string;
  type: 'MANDATORY' | 'NON-OBLIGATORY';
  time: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconBgColor?: string;
  iconColor?: string;
  isActive?: boolean;
  isEnabled?: boolean;
  onToggle?: (value: boolean) => void;
}

export function PrayerTimeRow({
  name,
  type,
  time,
  iconName,
  iconBgColor,
  iconColor,
  isActive = false,
  isEnabled = true,
  onToggle,
}: PrayerTimeRowProps) {
  const theme = useTheme();

  return (
    <Card
      style={[
        styles.card,
        {
          borderColor: isActive ? theme.primary : theme.border,
          borderWidth: isActive ? 2 : 1,
        },
      ]}
    >
      <View style={styles.leftSection}>
        <IconButton
          iconName={iconName}
          iconColor={iconColor ?? (isActive ? theme.primary : theme.text)}
          backgroundColor={iconBgColor ?? (isActive ? theme.primaryLight : theme.backgroundElement)}
          size={40}
          iconSize={20}
        />
        <View style={styles.textContainer}>
          <ThemedText style={styles.name}>{name}</ThemedText>
          <ThemedText style={styles.type} themeColor="textSecondary">
            {type}
          </ThemedText>
        </View>
      </View>

      <View style={styles.rightSection}>
        <ThemedText style={styles.time}>{time}</ThemedText>
        <Switch
          value={isEnabled}
          onValueChange={onToggle}
          trackColor={{ false: theme.border, true: theme.primaryLight }}
          thumbColor={isEnabled ? theme.primary : theme.tabIconDefault}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    marginVertical: Spacing.one,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  textContainer: {
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  type: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  time: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default PrayerTimeRow;
