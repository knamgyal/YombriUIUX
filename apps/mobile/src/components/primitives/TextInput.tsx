// apps/mobile/src/components/primitives/TextInput.tsx
import React from "react";
import {
  TextInput as RNTextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import { spacing, radius, typography } from "@yombri/design-tokens";
import { useTheme } from "../../providers/ThemeProvider";

export interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export function TextInput({
  label,
  error,
  containerStyle,
  inputStyle,
  editable = true,
  ...textInputProps
}: TextInputProps) {
  const { theme } = useTheme();
  const c = theme.colors;

  const combinedInputStyle: StyleProp<TextStyle> = [
    styles.inputBase,
    {
      backgroundColor: c.surface,
      borderColor: error ? c.error : c.outline ?? c.surfaceVariant,
      color: c.onSurface,
    },
    !editable ? styles.inputDisabled : undefined,
    inputStyle,
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: c.onBackground }]}>{label}</Text>
      ) : null}

      <RNTextInput
        style={combinedInputStyle}
        editable={editable}
        placeholderTextColor={c.onSurfaceVariant}
        {...textInputProps}
      />

      {error ? (
        <Text style={[styles.error, { color: c.error }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.gap.sm,
  },
  label: {
    fontFamily: typography.label.md.fontFamily,
    fontSize: typography.label.md.fontSize,
    lineHeight: typography.label.md.lineHeight,
    fontWeight: typography.label.md.fontWeight as any,
    marginBottom: spacing.gap.xs,
  },
  inputBase: {
    minHeight: spacing.touch,
    paddingHorizontal: spacing.gap.sm,
    paddingVertical: spacing.gap.xs,
    borderWidth: 1,
    borderRadius: radius.md,
    fontFamily: typography.body.md.fontFamily,
    fontSize: typography.body.md.fontSize,
    lineHeight: typography.body.md.lineHeight,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  error: {
    fontFamily: typography.label.sm.fontFamily,
    fontSize: typography.label.sm.fontSize,
    lineHeight: typography.label.sm.lineHeight,
    fontWeight: typography.label.sm.fontWeight as any,
    marginTop: spacing.gap.xs,
  },
});
