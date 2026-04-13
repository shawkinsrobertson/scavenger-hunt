import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Dimensions, View } from 'react-native';

const { width, height } = Dimensions.get('window');
const DIAGONAL = Math.ceil(Math.sqrt(width * width + height * height));

interface Props {
  visible: boolean;
  onClosed?: () => void;
  color?: string;
}

export function IrisTransition({ visible, onClosed, color = '#00115a' }: Props) {
  // We animate a colored circle that GROWS to cover the screen (close)
  // or SHRINKS to nothing (open)
  const scale = useRef(new Animated.Value(visible ? 0 : 1)).current;

  useEffect(() => {
    if (!visible) {
      // Close: grow the circle to cover everything
      Animated.timing(scale, {
        toValue: 1,
        duration: 700,
        easing: (t) => Math.floor(t * 8) / 8,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && onClosed) onClosed();
      });
    } else {
      // Open: shrink the circle away
      Animated.timing(scale, {
        toValue: 0,
        duration: 700,
        easing: (t) => Math.floor(t * 8) / 8,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.circle,
          {
            backgroundColor: color,
            transform: [{ scale }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  circle: {
    width: DIAGONAL,
    height: DIAGONAL,
    borderRadius: DIAGONAL / 2,
  },
});