import React from 'react';
import { ScrollView, StyleSheet, Pressable, View } from 'react-native';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export interface FilterTabsProps {
  tabs: string[];
  selectedTab: string;
  onSelectTab: (tab: string) => void;
}

export function FilterTabs({ tabs, selectedTab, onSelectTab }: FilterTabsProps) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {tabs.map((tab) => {
        const isSelected = tab === selectedTab;
        return (
          <Pressable
            key={tab}
            onPress={() => onSelectTab(tab)}
            style={[
              styles.tab,
              {
                backgroundColor: isSelected ? theme.primary : theme.cardBackground,
                borderColor: isSelected ? theme.primary : theme.border,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.tabText,
                {
                  color: isSelected ? theme.textOnPrimary : theme.textSecondary,
                  fontWeight: isSelected ? '700' : '500',
                },
              ]}
            >
              {tab}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
    flexDirection: 'row',
  },
  tab: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
  },
});

export default FilterTabs;
