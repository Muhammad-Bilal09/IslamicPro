import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { StyleSheet, View } from 'react-native';
import Card from './card';
import { ThemedText } from './themed-text';

export interface JourneyItemProps {
  progressValue: string | number;
  title: string;
  subtitle: string;
  type?: 'progress' | 'count' | 'icon';
  iconName?: string;
}

export function JourneyItem({ progressValue, title, subtitle, type = 'progress' }: JourneyItemProps) {
  const theme = useTheme();

  const getRingColor = () => {
    switch (type) {
      case 'count':
        return theme.success;
      case 'progress':
      default:
        return theme.accent;
    }
  };

  return (
    <Card variant="outlined" style={styles.card}>
      <View style={styles.container}>
        <View style={[styles.ring, { borderColor: getRingColor() }]}>
          <ThemedText style={[styles.progressText, { color: getRingColor() }]}>
            {progressValue}
          </ThemedText>
        </View>

        <View style={styles.textContainer}>
          <ThemedText style={styles.subtitle} themeColor="textSecondary">
            {subtitle}
          </ThemedText>
          <ThemedText style={styles.title}>{title}</ThemedText>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    marginVertical: Spacing.one,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  ring: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  textContainer: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
  },
});

export default JourneyItem;
