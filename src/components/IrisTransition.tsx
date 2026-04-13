import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import Svg, { Defs, Mask, Rect, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const MAX_R = Math.ceil(Math.sqrt(width * width + height * height) / 2) + 10;
const CX = width / 2;
const CY = height / 2;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  visible: boolean;       // true = open (screen visible), false = closing
  onClosed?: () => void;  // fires when iris is fully shut
  color?: string;
}

export function IrisTransition({ visible, onClosed, color = '#1a1a1a' }: Props) {
  const radius = useSharedValue(MAX_R);

  useEffect(() => {
    if (!visible) {
      radius.value = withTiming(0, {
        duration: 700,
        easing: Easing.steps(8, true),
      }, (finished) => {
        if (finished && onClosed) runOnJS(onClosed)();
      });
    } else {
      radius.value = withTiming(MAX_R, {
        duration: 700,
        easing: Easing.steps(8, true),
      });
    }
  }, [visible]);

  const animatedProps = useAnimatedProps(() => ({
    r: radius.value,
  }));

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
            animatedProps={animatedProps}
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