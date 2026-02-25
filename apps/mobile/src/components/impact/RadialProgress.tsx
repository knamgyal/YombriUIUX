// apps/mobile/src/components/impact/RadialProgress.tsx
import React from 'react';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../providers/ThemeProvider';

interface RadialProgressProps {
  /** 0–100 */
  progress: number;
  size?: number;
  strokeWidth?: number;
}

export function RadialProgress({
  progress,
  size = 80,
  strokeWidth = 8,
}: RadialProgressProps) {
  const { theme } = useTheme();
  const c = theme.colors;

  const clamped      = Math.min(100, Math.max(0, progress));
  const r            = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset    = circumference - (clamped / 100) * circumference;
  const center        = size / 2;

  // Fallbacks reference existing runtime theme tokens only.
  const trackColor:  string = c.progressTrack  ?? c.surfaceVariant;
  const activeColor: string = c.progressActive ?? c.primary;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background track */}
      <Circle
        cx={center}
        cy={center}
        r={r}
        stroke={trackColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress arc — starts from 12 o'clock via transform */}
      <Circle
        cx={center}
        cy={center}
        r={r}
        stroke={activeColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90, ${center}, ${center})`}
      />
    </Svg>
  );
}
