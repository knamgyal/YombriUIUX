// packages/native-runtime/src/primitives/TextInput.tsx

import React from "react";
import {
  TextInput as RNTextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  ViewStyle,
  TextStyle,
  StyleProp
} from "react-native";

import { colors, spacing, radius, typography } from "@yombri/design-tokens";

export interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  editable = true,
  ...textInputProps
}) => {
  const combinedInputStyle: StyleProp<TextStyle> = [
    styles.input,
    error ? styles.inputError : undefined,
    !editable ? styles.inputDisabled : undefined,
    inputStyle
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <RNTextInput
        style={combinedInputStyle}
        editable={editable}
        placeholderTextColor={colors.light.textMuted}
        {...textInputProps}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.gap.sm
  },
  label: {
    fontFamily: typography.label.md.fontFamily,
    fontSize: typography.label.md.fontSize,
    lineHeight: typography.label.md.lineHeight,
    fontWeight: typography.label.md.fontWeight as any,
    color: colors.light.text,
    marginBottom: spacing.gap.xs
  },
  input: {
    minHeight: spacing.touch,
    paddingHorizontal: spacing.gap.sm,
    paddingVertical: spacing.gap.xs,
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor:
      colors.light.outline ??
      colors.light.outlineVariant ??
      colors.neutral[200],
    borderRadius: radius.md,
    fontFamily: typography.body.md.fontFamily,
    fontSize: typography.body.md.fontSize,
    lineHeight: typography.body.md.lineHeight,
    color: colors.light.text
  },
  inputError: {
    borderColor: colors.light.danger
  },
  inputDisabled: {
    opacity: 0.5
  },
  error: {
    fontFamily: typography.label.sm.fontFamily,
    fontSize: typography.label.sm.fontSize,
    lineHeight: typography.label.sm.lineHeight,
    fontWeight: typography.label.sm.fontWeight as any,
    color: colors.light.danger,
    marginTop: spacing.gap.xs
  }
});
