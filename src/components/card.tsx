import React from 'react';
import { View, StyleSheet, type ViewProps, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'primary';
  style?: ViewStyle | ViewStyle[];
}

export function Card({ children, variant = 'default', style, ...props }: CardProps) {
  const theme = useTheme();

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.primary,
          borderColor: theme.primaryDark,
          borderWidth: 1,
        };
      case 'elevated':
        return {
          backgroundColor: theme.cardBackground,
          shadowColor: theme.text,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 2,
        };
      case 'outlined':
        return {
          backgroundColor: theme.cardBackground,
          borderWidth: 1,
          borderColor: theme.border,
        };
      case 'default':
      default:
        return {
          backgroundColor: theme.cardBackground,
        };
    }
  };

  return (
    <View style={[styles.card, getVariantStyle(), style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: Spacing.four,
    marginVertical: Spacing.two,
  },
});

export default Card;
