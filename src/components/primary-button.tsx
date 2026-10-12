import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'ghost';
};

export function PrimaryButton({
  title,
  loading = false,
  variant = 'primary',
  disabled,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';
  const backgroundColor = isPrimary ? theme.primary : 'transparent';
  const foreground = isPrimary ? theme.primaryText : theme.text;
  const inactive = Boolean(disabled) || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          borderColor: isPrimary ? backgroundColor : theme.border,
          opacity: inactive ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <ThemedText type="smallBold" style={{ color: foreground }}>
          {title}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
});
