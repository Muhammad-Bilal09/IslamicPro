import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import Card from './card';
import { ThemedText } from './themed-text';

export interface SurahListItemProps {
  number: number;
  englishName: string;
  arabicName: string;
  ayahCount: number;
  onPress?: () => void;
}

export function SurahListItem({
  number,
  englishName,
  arabicName,
  ayahCount,
  onPress,
}: SurahListItemProps) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress}>
      <Card variant="outlined" style={styles.card}>
        <View style={styles.leftSection}>
          <View style={[styles.numberContainer, { borderColor: theme.border }]}>
            <ThemedText style={styles.number}>{number}</ThemedText>
          </View>
          <View style={styles.textContainer}>
            <ThemedText style={styles.englishName}>{englishName}</ThemedText>
            <ThemedText style={styles.subtext} themeColor="textSecondary">
              • {ayahCount} AYAHS
            </ThemedText>
          </View>
        </View>

        <View style={styles.rightSection}>
          <Text style={[styles.arabicName, { color: theme.primary }]}>{arabicName}</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
        </View>
      </Card>
    </Pressable>
  );
}

import { Text } from 'react-native';

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
  numberContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '45deg' }],
  },
  number: {
    fontSize: 12,
    fontWeight: 'bold',
    transform: [{ rotate: '-45deg' }],
  },
  textContainer: {
    justifyContent: 'center',
  },
  englishName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtext: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  arabicName: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'serif',
    marginRight: Spacing.one,
  },
});

export default SurahListItem;
