import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';

export interface BadgeProps {
  text: string;
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'info' | 'light' | 'darkGreen';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({ text, variant = 'primary', style, textStyle }: BadgeProps) {
  const theme = useTheme();

  const getStyles = () => {
    let backgroundColor: string = theme.backgroundElement;
    let textColor: string = theme.text;

    switch (variant) {
      case 'primary':
        backgroundColor = theme.primaryLight;
        textColor = theme.primary;
        break;
      case 'darkGreen':
        backgroundColor = theme.primary;
        textColor = '#FFFFFF';
        break;
      case 'accent':
        backgroundColor = theme.accent;
        textColor = '#FFFFFF';
        break;
      case 'success':
        backgroundColor = theme.success + '20';
        textColor = theme.success;
        break;
      case 'warning':
        backgroundColor = '#FEF3C7';
        textColor = '#D97706';
        break;
      case 'info':
        backgroundColor = '#DBEAFE';
        textColor = '#2563EB';
        break;
      case 'light':
        backgroundColor = theme.cardBackground;
        textColor = theme.textSecondary;
        break;
    }

    return { backgroundColor, textColor };
  };

  const { backgroundColor, textColor } = getStyles();

  return (
    <View style={[styles.badge, { backgroundColor }, style]}>
      <Text style={[styles.text, { color: textColor }, textStyle]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 99,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export default Badge;
