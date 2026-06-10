import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  rightLabel?: string;
  onRightPress?: () => void;
}

export function SectionHeader({ title, subtitle, rightLabel, onRightPress }: SectionHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {subtitle && (
          <ThemedText style={styles.subtitle} themeColor="textSecondary">
            {subtitle}
          </ThemedText>
        )}
      </View>
      {rightLabel && onRightPress && (
        <Pressable onPress={onRightPress}>
          <ThemedText style={styles.rightLabel} themeColor="textSecondary">
            {rightLabel}
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginHorizontal: Spacing.one,
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },
  titleContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
  },
  rightLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SectionHeader;
