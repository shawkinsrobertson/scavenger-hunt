import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../styles/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CONFETTI_COLORS = [
  colors.primary,
  colors.secondary,
  colors.tertiary,
  colors.error,
  colors.primaryContainer,
  colors.tertiaryContainer,
];
const CONFETTI_COUNT = 20;

interface ConfettiPiece {
  x: number;
  delay: number;
  color: string;
  size: number;
}

const pieces: ConfettiPiece[] = Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
  x: Math.random() * SCREEN_WIDTH,
  delay: Math.random() * 1500,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  size: 8 + Math.random() * 8,
}));

function ConfettiPiece({ piece }: { piece: ConfettiPiece }) {
  const y = useRef(new Animated.Value(-20)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(piece.delay),
        Animated.parallel([
          Animated.timing(y, {
            toValue: SCREEN_HEIGHT + 20,
            duration: 3500,
            useNativeDriver: true,
          }),
          Animated.timing(rotation, {
            toValue: 1,
            duration: 3500,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 1, duration: 2800, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 700, useNativeDriver: true }),
          ]),
        ]),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '720deg'] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: piece.x,
        width: piece.size,
        height: piece.size,
        borderRadius: 2,
        backgroundColor: piece.color,
        transform: [{ translateY: y }, { rotate: spin }],
        opacity,
      }}
    />
  );
}

interface Props {
  message: string;
  totalStops: number;
}

export function CelebrationScreen({ message, totalStops }: Props) {
  const scale = useRef(new Animated.Value(0)).current;
  const cakeScale = useRef(new Animated.Value(0)).current;
  const balloonY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6, delay: 200 }).start();
    Animated.spring(cakeScale, { toValue: 1, useNativeDriver: true, friction: 5, delay: 400 }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(balloonY, { toValue: -8, duration: 1000, useNativeDriver: true }),
        Animated.timing(balloonY, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      {pieces.map((p, i) => (
        <ConfettiPiece key={i} piece={p} />
      ))}

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}> 
          <Animated.Text style={[styles.cakeEmoji, { transform: [{ scale: cakeScale }] }]}>
            🎂
          </Animated.Text>
          <Text style={styles.title}>You Did It!</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.summaryBadge}>
            <Text style={styles.summaryText}>
              🎁 {totalStops} stop{totalStops !== 1 ? 's' : ''} completed
            </Text>
          </View>
          <Animated.Text style={[styles.balloons, { transform: [{ translateY: balloonY }] }]}>🎈🎈🎈</Animated.Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.inversePrimary },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    gap: 20,
    shadowColor: colors.inversePrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
    zIndex: 1,
  },
  cakeEmoji: { fontSize: 64 },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 26,
    textAlign: 'center',
  },
  summaryBadge: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  summaryText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
