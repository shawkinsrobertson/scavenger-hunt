import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { HuntStop } from '../data/hunt';

interface Props {
  stop: HuntStop;
  stopNumber: number;
  totalStops: number;
  onConfirmed: () => void;
}

export function PickupScreen({ stop, stopNumber, totalStops, onConfirmed }: Props) {
  const [confirmed, setConfirmed] = useState(false);
  const emojiScale = useRef(new Animated.Value(0)).current;

  const progressPercent = ((stopNumber - 1) / totalStops) * 100;

  function handleConfirm() {
    setConfirmed(true);
    Animated.spring(emojiScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
    setTimeout(onConfirmed, 2200);
  }

  useEffect(() => {
    // reset when reused
    emojiScale.setValue(0);
    setConfirmed(false);
  }, [stop.id]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { width: `${progressPercent}%` as `${number}%` }]} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.stopBadge}>
            <Text style={styles.stopBadgeText}>Stop {stopNumber} of {totalStops}</Text>
          </View>

          {!confirmed ? (
            <>
              <Text style={styles.emoji}>📍</Text>
              <Text style={styles.heading}>You're Here!</Text>
              <View style={styles.arrivalBox}>
                <Text style={styles.arrivalText}>{stop.arrivalMessage}</Text>
              </View>
              <TouchableOpacity style={styles.btn} onPress={handleConfirm} activeOpacity={0.85}>
                <Text style={styles.btnText}>✅ {stop.confirmLabel}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Animated.Text style={[styles.confirmedEmoji, { transform: [{ scale: emojiScale }] }]}>
                🎊
              </Animated.Text>
              <Text style={styles.heading}>{stop.confirmedMessage}</Text>
              <LoadingDots />
            </>
          )}
        </View>
      </View>
    </View>
  );
}

function LoadingDots() {
  const dots = [
    useRef(new Animated.Value(0.5)).current,
    useRef(new Animated.Value(0.5)).current,
    useRef(new Animated.Value(0.5)).current,
  ];

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.5, duration: 400, useNativeDriver: true }),
        ]),
      ),
    );
    animations.forEach(a => a.start());
    return () => animations.forEach(a => a.stop());
  }, []);

  return (
    <View style={dotStyles.row}>
      {dots.map((dot, i) => (
        <Animated.View key={i} style={[dotStyles.dot, { opacity: dot }]} />
      ))}
    </View>
  );
}

const dotStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#7c3aed' },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#22c55e' },
  progressTrack: { height: 5, backgroundColor: 'rgba(255,255,255,0.3)' },
  progressBar: {
    height: 5,
    backgroundColor: '#fff',
    borderBottomRightRadius: 3,
    borderTopRightRadius: 3,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  stopBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  stopBadgeText: { fontSize: 13, fontWeight: '600', color: '#16a34a' },
  emoji: { fontSize: 48 },
  confirmedEmoji: { fontSize: 56 },
  heading: { fontSize: 22, fontWeight: '700', color: '#1f2937', textAlign: 'center' },
  arrivalBox: {
    backgroundColor: '#dcfce7',
    borderRadius: 14,
    padding: 16,
    width: '100%',
  },
  arrivalText: { fontSize: 16, color: '#1f2937', lineHeight: 24 },
  btn: {
    backgroundColor: '#16a34a',
    borderRadius: 16,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
