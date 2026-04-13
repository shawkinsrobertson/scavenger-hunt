import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  Share,
  TouchableOpacity,
  Image,
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
          Animated.timing(y, { toValue: SCREEN_HEIGHT + 20, duration: 3500, useNativeDriver: true }),
          Animated.timing(rotation, { toValue: 1, duration: 3500, useNativeDriver: true }),
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

// ─── Stats terminal ──────────────────────────────────────────────────────────

function makeLine(label: string, value: string | number, totalWidth = 26): string {
  const v = String(value);
  const dots = '.'.repeat(Math.max(2, totalWidth - label.length - v.length));
  return `${label}${dots}${v}`;
}

function generateStats(totalStops: number, distanceMeters: number, stepsWalked: number): string[] {
  return [
    '[ BIRTHDAY STATS REPORT ]',
    '\u2500'.repeat(24),
    makeLine('STOPS COMPLETED', totalStops),
    makeLine('STEPS WALKED', stepsWalked > 0 ? stepsWalked.toLocaleString() : Math.floor(Math.random() * 4000 + 4000).toLocaleString()),
    makeLine('METERS TRAVELED', distanceMeters > 0 ? distanceMeters : Math.floor(Math.random() * 1500 + 800)),
    makeLine('CRUMPETS EATEN', Math.floor(Math.random() * 4 + 1)),
    makeLine('CARDS RESCUED', Math.floor(Math.random() * 35 + 12)),
    makeLine('BOATS EMBARKED', Math.floor(Math.random() * 5 + 2)),
    '\u2500'.repeat(24),
    makeLine('BIRTHDAY RATING', '\u2605\u2605\u2605\u2605\u2605'),
    makeLine('FINAL SCORE', Math.floor(Math.random() * 900000 + 100000)),
  ];
}

function StatsPanel({ totalStops, distanceMeters, stepsWalked }: { totalStops: number; distanceMeters: number; stepsWalked: number }) {
  const statLines = useRef(generateStats(totalStops, distanceMeters, stepsWalked)).current;
  const [displayed, setDisplayed] = useState<string[]>([]);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [done, setDone] = useState(false);
  const panelOpacity = useRef(new Animated.Value(0)).current;

  // Fade panel in before typing starts
  useEffect(() => {
    const t = setTimeout(() => {
      Animated.timing(panelOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, 1400);
    return () => clearTimeout(t);
  }, []);

  // Blinking cursor
  useEffect(() => {
    const t = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(t);
  }, []);

  // Teletype
  useEffect(() => {
    let li = 0;
    let ci = 0;
    let timer: ReturnType<typeof setTimeout>;

    function tick() {
      if (li >= statLines.length) {
        setDone(true);
        return;
      }

      const line = statLines[li];

      if (ci <= line.length) {
        const chunk = line.slice(0, ci);
        setDisplayed(prev => {
          const next = [...prev];
          while (next.length <= li) next.push('');
          next[li] = chunk;
          return next;
        });
        ci++;
        timer = setTimeout(tick, 20);
      } else {
        li++;
        ci = 0;
        // Longer pause after the header and dividers
        const prevLine = statLines[li - 1];
        const pause = prevLine.startsWith('[') || prevLine.startsWith('\u2500') ? 180 : 60;
        timer = setTimeout(tick, pause);
      }
    }

    const startDelay = setTimeout(tick, 2000);
    return () => {
      clearTimeout(startDelay);
      clearTimeout(timer);
    };
  }, [statLines]);

  function handleShare() {
    Share.share({ message: statLines.join('\n') });
  }

  return (
    <Animated.View style={[termStyles.panel, { opacity: panelOpacity }]}>
      {displayed.map((line, i) => {
        const isHeader = line.startsWith('[');
        const isDivider = line.startsWith('\u2500');
        const isFinal = line.startsWith('FINAL');
        const isLast = i === displayed.length - 1 && !done;
        return (
          <Text
            key={i}
            style={[
              termStyles.line,
              isHeader && termStyles.headerLine,
              isDivider && termStyles.dividerLine,
              isFinal && termStyles.finalLine,
            ]}
          >
            {line}{isLast ? (cursorVisible ? '\u2588' : ' ') : ''}
          </Text>
        );
      })}

      {done && (
        <TouchableOpacity style={termStyles.shareBtn} onPress={handleShare} activeOpacity={0.7}>
          <Image source={require('../assets/share-icon.png')} style={termStyles.shareIcon} />
          <Text style={termStyles.shareLabel}>SHARE</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const termStyles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: colors.onPrimaryContainer,
    padding: 18,
    width: '100%',
    maxWidth: 440,
    marginTop: 16,
    marginBottom: 8,
  },
  line: {
    fontFamily: 'RobotoMono-Regular',
    fontSize: 13,
    color: '#00115a',
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  headerLine: {
    fontFamily: 'RobotoMono-Bold',
    color: '#2d1229',
    textAlign: 'center',
  },
  dividerLine: {
    color: '#1a4228',
  },
  finalLine: {
    fontFamily: 'RobotoMono-Bold',
    color: '#2c03d1',
    fontSize: 15,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  shareIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  shareLabel: {
    fontFamily: 'RobotoMono-Bold',
    fontSize: 12,
    color: colors.primary,
    letterSpacing: 0.5,
  },
});

// ─── Main screen ─────────────────────────────────────────────────────────────

interface Props {
  message: string;
  totalStops: number;
  distanceMeters: number;
  stepsWalked: number;
}

export function CelebrationScreen({ message, totalStops, distanceMeters, stepsWalked }: Props) {
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
      {pieces.map((p, i) => <ConfettiPiece key={i} piece={p} />)}

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <Animated.Image
            source={require('../assets/cake.png')}
            style={[styles.cakeImage, { transform: [{ scale: cakeScale }] }]}
          />
          <Text style={styles.title}>You Did It!</Text>
          <Text style={styles.message}>{message}</Text>
          <Animated.Image
            source={require('../assets/balloon.png')}
            style={[styles.balloonImage, { transform: [{ translateY: balloonY }] }]}
          />
        </Animated.View>

        <StatsPanel totalStops={totalStops} distanceMeters={distanceMeters} stepsWalked={stepsWalked} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    experimental_backgroundImage: "radial-gradient(#fefbff 65%, #e2e1ec 85%, #dfe1f9 95%)",
  },

  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    paddingBottom: 40,
  },

  card: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: 'transparent',
    borderRadius: 4,
    padding: 16,
    width: '100%',
    height: '100%',
    marginBottom: 16,
    gap: 12,
  },

  cakeImage: {
    width: 92,
    height: 92,
    marginBottom: 6,
  },
  title: {
    fontFamily: 'PixelifySans-Bold',
    fontSize: 48,
    color: colors.onPrimaryContainer,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'RobotoMono-Regular',
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 26,
    textAlign: 'center',
  },
  summaryBadge: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 4,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  summaryText: {
    fontFamily: 'PixelifySans-SemiBold',
    fontSize: 20,
    color: colors.textMuted,
  },
  balloonImage: {
    width: 120,
    height: 120,
    marginTop: 18,
  },
});
