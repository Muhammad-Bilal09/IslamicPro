import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from 'react-native';

interface FormInputProps extends TextInputProps {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  error?: string | null;
  isPassword?: boolean;
}

export function FormInput({
  label,
  iconName,
  error,
  isPassword = false,
  editable = true,
  ...rest
}: FormInputProps) {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const hasFocus = false;

  return (
    <View style={styles.wrapper}>
      <ThemedText style={styles.label} themeColor="textSecondary">
        {label}
      </ThemedText>

      <View
        style={[
          styles.inputRow,
          {
            borderColor: error ? '#DC2626' : theme.border,
            backgroundColor: theme.background,
          },
          !editable && { opacity: 0.5 },
        ]}
      >
        <Ionicons
          name={iconName}
          size={18}
          color={error ? '#DC2626' : theme.textSecondary}
          style={styles.icon}
        />

        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholderTextColor={theme.textSecondary}
          secureTextEntry={isPassword && !showPassword}
          editable={editable}
          {...rest}
        />

        {isPassword && (
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            hitSlop={12}
            style={styles.eyeBtn}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.textSecondary}
            />
          </Pressable>
        )}
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={13} color="#DC2626" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.three,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    height: 52,
    paddingHorizontal: Spacing.three,
  },
  icon: {
    marginRight: Spacing.two,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
  },
  eyeBtn: {
    padding: 4,
    marginLeft: 4,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },
  errorText: {
    fontSize: 11.5,
    color: '#DC2626',
    fontWeight: '500',
  },
});
