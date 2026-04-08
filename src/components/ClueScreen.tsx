import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Animated, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useGeolocation, distanceBetween } from '../hooks/useGeolocation';
import type { HuntStop } from '../data/hunt';
import { colors } from '../styles/colors';

interface Props {
  stop: HuntStop;
  stopNumber: number;
  totalStops: number;
  onArrived: () => void;
}

function getClue(stop: HuntStop, distance: number): string {
  if (distance > 500) return stop.clues.far;
  if (distance > 100) return stop.clues.medium;
  return stop.clues.near;
}

function bearingBetween(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function ProximityIndicator({ distance }: { distance: number }) {
  const bars = distance <= 100 ? 3 : distance <= 500 ? 2 : 1;
  const color = distance <= 100 ? colors.primary : distance <= 500 ? colors.tertiary : colors.error;
  const label = distance <= 100 ? 'Getting close!' : distance <= 500 ? 'Warmer…' : 'Far away';

  return (
    <View style={proximityStyles.container}>
      <View style={proximityStyles.bars}>
        {[1, 2, 3].map(i => (
          <View
            key={i}
            style={[
              proximityStyles.bar,
              {
                backgroundColor: i <= bars ? color : colors.surface,
                height: i * 10 + 10,
              },
            ]}
          />
        ))}
      </View>
      <Text style={[proximityStyles.label, { color }]}>{label}</Text>
    </View>
  );
}

const proximityStyles = StyleSheet.create({
  container: { alignItems: 'center', gap: 8 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 44 },
  bar: { width: 20, borderRadius: 4 },
  label: { fontSize: 14, fontWeight: '700' },
});

export function ClueScreen({ stop, stopNumber, totalStops, onArrived }: Props) {
  const geo = useGeolocation();
  const arrivalThreshold = 6;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const accumulatedRotation = useRef(0);
  const prevBearing = useRef<number | null>(null);

  const bearing =
    geo.lat !== null && geo.lng !== null
      ? bearingBetween(geo.lat, geo.lng, stop.location.lat, stop.location.lng)
      : null;

  useEffect(() => {
    if (bearing === null) return;

    if (prevBearing.current === null) {
      // First fix — jump straight to the bearing with no animation
      accumulatedRotation.current = bearing;
      rotation.setValue(bearing);
    } else {
      // Subsequent updates — always take the shortest arc (handles 350°→10° correctly)
      let delta = bearing - prevBearing.current;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      accumulatedRotation.current += delta;

      Animated.timing(rotation, {
        toValue: accumulatedRotation.current,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }

    prevBearing.current = bearing;
  }, [bearing]);

  function handleButtonPress() {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -6,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 6,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(translateX, { toValue: 0, duration: 100, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
    });
    onArrived();
  }

  const distance =
    geo.lat !== null && geo.lng !== null
      ? distanceBetween(geo.lat, geo.lng, stop.location.lat, stop.location.lng)
      : null;

  const hasArrived = distance !== null && distance <= arrivalThreshold;

  const progressPercent = ((stopNumber - 1) / totalStops) * 100;

  function formatDistance(d: number) {
    return d < 1000 ? `${Math.round(d)}m` : `${(d / 1000).toFixed(1)}km`;
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { width: `${progressPercent}%` as `${number}%` }]} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.stopBadge}>
            <Text style={styles.stopBadgeText}>Stop {stopNumber} of {totalStops}</Text>
          </View>

          <View style={styles.compassContainer}>
            <Image source={require('../assets/compass-ring.png')} style={styles.compassRing} />
            <Animated.Image
              source={require('../assets/compass-arrow.png')}
              style={[styles.compassArrow, { transform: [{ rotate: rotation.interpolate({ inputRange: [-3600, 3600], outputRange: ['-3600deg', '3600deg'] }) }] }]}
            />
          </View>
          <Text style={styles.heading}>Follow the Clue</Text>

          {geo.loading && (
            <Text style={styles.muted}>Finding your location…</Text>
          )}

          {geo.error != null && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>📡 {geo.error}</Text>
              <Text style={styles.errorSmall}>Make sure location access is allowed.</Text>
            </View>
          )}

          {!geo.loading && geo.error == null && distance !== null && (
            <>
              <ProximityIndicator distance={distance} />
              <View style={styles.clueBox}>
                <Text style={styles.clueText}>{getClue(stop, distance)}</Text>
              </View>
              <Text style={styles.distanceBadge}>~{formatDistance(distance)} away</Text>
            </>
          )}

          {!geo.loading && geo.error == null && distance === null && (
            <View style={styles.clueBox}>
              <Text style={styles.clueText}>{stop.clues.far}</Text>
            </View>
          )}

          {hasArrived && (
            <TouchableOpacity onPress={handleButtonPress} activeOpacity={1}>
              <Animated.Image
                source={require('../assets/btn-primary-active.png')}
                style={[
                  styles.buttonImage,
                  {
                    transform: [{ translateX }, { translateY }],
                  },
                ]}
              />
            </TouchableOpacity>
          )}

          {geo.accuracy !== null && (
            <Text style={styles.accuracy}>GPS accuracy: ±{Math.round(geo.accuracy)}m</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.secondary },
  progressTrack: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  progressBar: {
    height: 5,
    backgroundColor: colors.surface,
    borderBottomRightRadius: 3,
    borderTopRightRadius: 3,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 4,
    padding: 28,
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    gap: 16,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  stopBadge: {
    backgroundColor: colors.primaryContainer,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  stopBadgeText: { fontFamily: "RobotoMono-Regular", fontSize: 13, color: colors.primary },
  heroImage: { width: 84, height: 84, marginVertical: 4 },
  heading: { fontFamily: "PixelifySans-SemiBold", fontSize: 32, color: colors.text },
  muted: { fontFamily: "RobotoMono-Regular", fontSize: 15, color: colors.textMuted },
  errorBox: {
    backgroundColor: colors.errorContainer,
    borderRadius: 4,
    padding: 14,
    width: '100%',
  },
  errorText: { fontFamily: "RobotoMono-Regular", fontSize: 14, color: colors.error, marginBottom: 4 },
  errorSmall: { fontFamily: "RobotoMono-Regular", fontSize: 12, color: colors.onErrorContainer },
  clueBox: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 4,
    padding: 16,
    width: '100%',
  },
  clueText: { fontFamily: "RobotoMono-Regular", fontSize: 16, color: colors.text, lineHeight: 24 },
  distanceBadge: { fontFamily: "PixelifySans-SemiBold", fontSize: 40, color: colors.textMuted, marginTop: 16 },
  buttonImage: {
    width: '100%',
    height: 60,
    resizeMode: 'contain',
  },
  compassContainer: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  compassRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    resizeMode: 'contain',
  },
  compassArrow: {
    position: 'absolute',
    width: 84,
    height: 84,
    resizeMode: 'contain',
  },

  accuracy: {
    fontFamily: "RobotoMono-Regular",
    fontSize: 12,
    color: colors.textMuted,
  },
});
