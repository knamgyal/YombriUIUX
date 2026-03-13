import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getCurrentUserId, getSupabaseClient } from '@yombri/supabase-client';
import { useTheme } from '../providers/ThemeProvider';

type EditableProfile = {
  id: string;
  handle: string | null;
  display_name: string | null;
  created_at?: string | null;
};

type Palette = {
  bg: string;
  surface: string;
  border: string;
  divider: string;
  text: string;
  textMuted: string;
  textSoft: string;
  primary: string;
  primaryText: string;
  danger: string;
  avatarBg: string;
  inputBg: string;
};

const HANDLE_REGEX = /^[a-z0-9_]{3,30}$/;

function getPalette(themeApi: any): Palette {
  const colors = themeApi?.theme?.colors ?? themeApi?.colors ?? {};

  return {
    bg: colors.background ?? '#0B1020',
    surface: colors.card ?? colors.surface ?? '#121A30',
    border: colors.border ?? '#1E2947',
    divider: colors.divider ?? '#263252',
    text: colors.text ?? '#FFFFFF',
    textMuted: colors.textMuted ?? '#9BA7C2',
    textSoft: colors.textSoft ?? '#7F8AA3',
    primary: colors.primary ?? '#5B7FFF',
    primaryText: colors.primaryText ?? '#FFFFFF',
    danger: colors.danger ?? '#FF7A7A',
    avatarBg: colors.avatarBg ?? colors.primaryMuted ?? '#31406B',
    inputBg: colors.inputBg ?? colors.surface ?? '#121A30',
  };
}

export default function EditProfileScreen() {
  const themeApi = useTheme() as any;
  const insets = useSafeAreaInsets();
  const palette = useMemo(() => getPalette(themeApi), [themeApi]);
  const styles = useMemo(
    () => createStyles(palette, insets.top, insets.bottom),
    [palette, insets.top, insets.bottom]
  );

  const client = useMemo(() => getSupabaseClient(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [original, setOriginal] = useState<EditableProfile | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');

  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  const [handleError, setHandleError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    const currentUserId = await getCurrentUserId();
    setUserId(currentUserId);

    const { data, error } = await client
      .from('users')
      .select('id, handle, display_name, created_at')
      .eq('id', currentUserId)
      .single();

    if (error) throw error;

    const profile = data as EditableProfile;
    setOriginal(profile);
    setDisplayName(profile.display_name ?? '');
    setHandle(profile.handle ?? '');
  }, [client]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        await loadProfile();
      } catch (error: any) {
        if (!active) return;
        Alert.alert('Could not load profile', error?.message ?? 'Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [loadProfile]);

  const validate = useCallback(() => {
    let valid = true;

    const trimmedDisplayName = displayName.trim();
    const normalizedHandle = handle.trim().toLowerCase();

    setDisplayNameError(null);
    setHandleError(null);

    if (trimmedDisplayName.length > 100) {
      setDisplayNameError('Display name must be 100 characters or fewer.');
      valid = false;
    }

    if (normalizedHandle.length > 0 && !HANDLE_REGEX.test(normalizedHandle)) {
      setHandleError(
        'Handle must be 3–30 chars, lowercase letters, numbers, or underscore.'
      );
      valid = false;
    }

    return valid;
  }, [displayName, handle]);

  const hasChanges = useMemo(() => {
    if (!original) return false;

    return (
      (original.display_name ?? '') !== displayName.trim() ||
      (original.handle ?? '') !== handle.trim().toLowerCase()
    );
  }, [original, displayName, handle]);

  const onSave = useCallback(async () => {
    if (!userId) return;
    if (!validate()) return;

    const trimmedDisplayName = displayName.trim();
    const normalizedHandle = handle.trim().toLowerCase();

    setSaving(true);

    try {
      const payload = {
        display_name: trimmedDisplayName.length > 0 ? trimmedDisplayName : null,
        handle: normalizedHandle.length > 0 ? normalizedHandle : null,
      };

      const { data, error } = await client
        .from('users')
        .update(payload)
        .eq('id', userId)
        .select('id, handle, display_name, created_at')
        .single();

      if (error) {
        const message = String(error.message ?? '').toLowerCase();

        if (message.includes('duplicate') || message.includes('unique')) {
          setHandleError('That handle is already taken.');
          throw new Error('Please choose another handle.');
        }

        throw error;
      }

      const updated = data as EditableProfile;
      setOriginal(updated);
      setDisplayName(updated.display_name ?? '');
      setHandle(updated.handle ?? '');

      Alert.alert('Saved', 'Your profile has been updated.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Save failed', error?.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  }, [client, displayName, handle, userId, validate]);

  if (loading) {
    return (
      <View style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={styles.loadingText}>Loading edit form…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heroCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(displayName?.[0] || handle?.[0] || 'Y').toUpperCase()}
              </Text>
            </View>

            <Text style={styles.heroTitle}>Edit profile</Text>
            <Text style={styles.heroSubtitle}>
              Keep this lightweight and trustworthy for the current phase.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Identity</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Display name</Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="How your name appears"
                placeholderTextColor={palette.textSoft}
                style={[styles.input, !!displayNameError && styles.inputError]}
                maxLength={100}
                autoCapitalize="words"
                returnKeyType="next"
              />
              {!!displayNameError && (
                <Text style={styles.errorText}>{displayNameError}</Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Handle</Text>
              <TextInput
                value={handle}
                onChangeText={(text) => setHandle(text.toLowerCase())}
                placeholder="lowercase_handle"
                placeholderTextColor={palette.textSoft}
                style={[styles.input, !!handleError && styles.inputError]}
                maxLength={30}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
              />
              <Text style={styles.helperText}>
                3–30 characters, lowercase letters, numbers, and underscore only.
              </Text>
              {!!handleError && <Text style={styles.errorText}>{handleError}</Text>}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>User ID</Text>
                <Text style={styles.infoValue}>{userId ?? '—'}</Text>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Current handle</Text>
                <Text style={styles.infoValue}>{original?.handle ?? '—'}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (!hasChanges || saving) && styles.saveButtonDisabled,
            ]}
            onPress={onSave}
            disabled={!hasChanges || saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color={palette.primaryText} />
            ) : (
              <Text style={styles.saveButtonText}>Save changes</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function createStyles(colors: Palette, insetTop: number, insetBottom: number) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    flex: {
      flex: 1,
    },
    container: {
      paddingTop: Math.max(insetTop, 12),
      paddingHorizontal: 16,
      paddingBottom: Math.max(insetBottom + 24, 40),
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    loadingText: {
      marginTop: 12,
      color: colors.textMuted,
      fontSize: 15,
    },
    heroCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.avatarBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    avatarText: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '700',
    },
    heroTitle: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '700',
    },
    heroSubtitle: {
      color: colors.textMuted,
      fontSize: 13,
      marginTop: 6,
      textAlign: 'center',
    },
    section: {
      marginBottom: 16,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '700',
      marginBottom: 10,
    },
    field: {
      marginBottom: 14,
    },
    label: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.divider,
      color: colors.text,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 14,
      fontSize: 15,
    },
    inputError: {
      borderColor: colors.danger,
    },
    helperText: {
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 6,
    },
    errorText: {
      color: colors.danger,
      fontSize: 12,
      marginTop: 6,
    },
    infoCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    infoRow: {
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    infoLabel: {
      color: colors.textMuted,
      fontSize: 12,
      marginBottom: 6,
    },
    infoValue: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    infoDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.divider,
    },
    saveButton: {
      backgroundColor: colors.primary,
      minHeight: 52,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
    },
    saveButtonDisabled: {
      opacity: 0.55,
    },
    saveButtonText: {
      color: colors.primaryText,
      fontSize: 15,
      fontWeight: '700',
    },
    cancelButton: {
      minHeight: 52,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
      borderWidth: 1,
      borderColor: colors.divider,
      backgroundColor: colors.surface,
    },
    cancelButtonText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
  });
}
