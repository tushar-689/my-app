import { Animated, StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function ProgressBar({
  value,
  color,
}: {
  value: number;
  color?: string;
}) {
  const theme = useTheme();
  const [width] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(width, {
      toValue: Math.min(100, Math.max(0, value)),
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [value, width]);
  return (
    <View style={[styles.track, { backgroundColor: theme.surfaceElevated }]}>
      <Animated.View
        style={[
          styles.fill,
          {
            width: width.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
            backgroundColor: color ?? theme.accentGreen,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: Radius.pill },
});
