import { useTheme } from '@/hooks/use-theme';
import { StyleSheet, View, type ViewStyle } from 'react-native';

export interface ProgressBarProps {
  progress: number;
  height?: number;
  trackColor?: string;
  progressColor?: string;
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  height = 8,
  trackColor,
  progressColor,
  style,
}: ProgressBarProps) {
  const theme = useTheme();

  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor: trackColor ?? theme.border,
          borderRadius: height / 2,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress * 100}%`,
            backgroundColor: progressColor ?? theme.accent,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});

export default ProgressBar;
