import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Dimensions, Easing } from 'react-native';
import Svg, { Defs, Mask, Rect, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const MAX_R = Math.ceil(Math.sqrt(width * width + height * height) / 2) + 10;
const CX = width / 2;
const CY = height / 2;

// Wire Animated into SVG Circle's r prop
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  visible: boolean;
  onClosed?: () => void;
  color?: string;
}

export function IrisTransition({ visible, onClosed, color = '#1a1a1a' }: Props) {
  const radius = useRef(new Animated.Value(MAX_R)).current;

  useEffect(() => {
    if (!visible) {
      // Close: shrink to 0 in 8 discrete steps
      Animated.timing(radius, {
        toValue: 0,
        duration: 700,
        easing: (t) => Math.floor(t * 8) / 8,
        useNativeDriver: false, // r prop can't use native driver
      }).start(({ finished }) => {
        if (finished && onClosed) onClosed();
      });
    } else {
      // Open: expand back out in 8 steps
      Animated.timing(radius, {
        toValue: MAX_R,
        duration: 700,
        easing: (t) => Math.floor(t * 8) / 8,
        useNativeDriver: false,
      }).start();
    }
  }, [visible]);

  return (
    <Svg
      width={width}
      height={height}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <Defs>
        <Mask id="irisMask">
          <Rect x={0} y={0} width={width} height={height} fill="black" />
          <AnimatedCircle
            cx={CX}
            cy={CY}
            r={radius}
            fill="white"
          />
        </Mask>
      </Defs>
      <Rect
        x={0} y={0}
        width={width} height={height}
        fill={color}
        mask="url(#irisMask)"
      />
    </Svg>
  );
}