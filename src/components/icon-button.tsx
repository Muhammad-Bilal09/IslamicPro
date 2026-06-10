import React from 'react';
import { View, StyleSheet, Pressable, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/theme';

export interface IconButtonProps {
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconColor?: string;
  backgroundColor?: string;
  size?: number;
  iconSize?: number;
  onPress?: () => void;
  style?: ViewStyle;
}

export function IconButton({
  iconName,
  iconColor = '#FFFFFF',
  backgroundColor = '#094C3A',
  size = 48,
  iconSize = 24,
  onPress,
  style,
}: IconButtonProps) {
  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
  };

  const content = (
    <View style={[containerStyle, style]}>
      <Ionicons name={iconName as any} size={iconSize} color={iconColor} />
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({});

export default IconButton;
