import { View, Text } from 'react-native';
import { useEffect, useState } from 'react';
import { colors, spacing, typography } from '@yombri/design-tokens';
import { generateTOTP } from '@yombri/supabase-client';

interface TOTPDisplayProps {
  secretKey: string;
}

export function TOTPDisplay({ secretKey }: TOTPDisplayProps) {
  const [code, setCode] = useState<string>('');
  const [secondsLeft, setSecondsLeft] = useState<number>(30);

  useEffect(() => {
    const updateCode = () => {
      const newCode = generateTOTP(secretKey);
      setCode(newCode);
      
      const now = Math.floor(Date.now() / 1000);
      const timeInWindow = now % 30;
      setSecondsLeft(30 - timeInWindow);
    };

    updateCode();
    const interval = setInterval(updateCode, 1000);

    return () => clearInterval(interval);
  }, [secretKey]);

  const formattedCode = code.match(/.{1,3}/g)?.join(' ') || code;

  return (
    <View 
      className="items-center justify-center p-8 rounded-lg"
      style={{ backgroundColor: colors.neutral[900] }}
    >
      <Text
        style={{
          fontSize: 12,
          color: colors.neutral[400],
          fontWeight: '600',
          letterSpacing: 1,
        }}
        className="mb-2"
      >
        VISUAL CHECK-IN CODE
      </Text>
      
      <Text
        style={{
          fontSize: 64,
          fontWeight: '700',
          color: colors.neutral[50],
          letterSpacing: 8,
        }}
        className="mb-4"
      >
        {formattedCode}
      </Text>
      
      <View className="flex-row items-center">
        <View 
          className="h-1 rounded-full mr-2"
          style={{ 
            width: 120,
            backgroundColor: colors.neutral[700],
          }}
        >
          <View 
            className="h-1 rounded-full"
            style={{ 
              width: `${(secondsLeft / 30) * 100}%`,
              backgroundColor: secondsLeft > 10 ? colors.brand.emerald : colors.semantic.warning,
            }}
          />
        </View>
        <Text
          style={{
            fontSize: typography.label.size,
            color: colors.neutral[400],
          }}
        >
          {secondsLeft}s
        </Text>
      </View>
    </View>
  );
}
