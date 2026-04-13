import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useGeolocation, distanceBetween } from '../hooks/useGeolocation';
import { useHeading } from '../hooks/useHeading';
import type { HuntStop } from '../data/hunt';
import { colors } from '../styles/colors';

interface Props {
  stop: HuntStop;
  stopNumber: number;
  totalStops: number;
  onArrived: () => void;
  devMode?: boolean;
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

export function ClueScreen({ stop, stopNumber, totalStops, onArrived, devMode }: Props) {
  const geo = useGeolocation();
  const heading = useHeading();
  const arrivalThreshold = 6;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const accumulatedRotation = useRef(0);
  const prevAngle = useRef<number | null>(null);

  const bearing =
    geo.lat !== null && geo.lng !== null
      ? bearingBetween(geo.lat, geo.lng, stop.location.lat, stop.location.lng)
      : null;

  // Relative angle: where to point the arrow given current device orientation.
  // If heading is unavailable fall back to absolute bearing (phone-facing-north assumption).
  const relativeAngle =
    bearing !== null && heading !== null
      ? (bearing - heading + 360) % 360
      : bearing;

  useEffect(() => {
    if (relativeAngle === null) return;

    if (prevAngle.current === null) {
      // First fix — jump straight to angle with no animation
      accumulatedRotation.current = relativeAngle;
      rotation.setValue(relativeAngle);
    } else {
      // Subsequent updates — always take the shortest arc (handles 350°→10° correctly)
      let delta = relativeAngle - prevAngle.current;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      accumulatedRotation.current += delta;

      // Spring handles rapid heading interruptions more gracefully than timing
      Animated.spring(rotation, {
        toValue: accumulatedRotation.current,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }

    prevAngle.current = relativeAngle;
  }, [relativeAngle]);

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

  const hasArrived = devMode || (distance !== null && distance <= arrivalThreshold);

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
            <Image source={require('../assets/compass-ring-only.png')} style={styles.compassRing} />
            <Animated.Image
              source={require('../assets/compass-arrow.png')}
              style={[styles.compassArrow, { transform: [{ rotate: rotation.interpolate({ inputRange: [-3600, 3600], outputRange: ['-3600deg', '3600deg'] }) }] }]}
            />
          </View>
        
          <Text style={styles.heading}>Follow the Clue</Text>

          {!devMode && geo.loading && (
            <Text style={styles.muted}>Finding your location…</Text>
          )}

          {!devMode && geo.error != null && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>📡 {geo.error}</Text>
              <Text style={styles.errorSmall}>Make sure location access is allowed.</Text>
            </View>
          )}

          {(devMode || (!geo.loading && geo.error == null && distance !== null)) && (
            <>
              {distance !== null && <ProximityIndicator distance={distance} />}
              <View style={styles.clueBox}>
                <Text style={styles.clueText}>
                  {distance !== null ? getClue(stop, distance) : stop.clues.far}
                </Text>
              </View>
              {distance !== null && (
                <Text style={styles.distanceBadge}>~{formatDistance(distance)} away</Text>
              )}
            </>
          )}

          {hasArrived && (
            <TouchableOpacity onPress={handleButtonPress} activeOpacity={1} style={styles.buttonContainer}>
              <Animated.Image
                source={require('../assets/confirm-arrival-primary.png')}
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
  screen: { 
    flex: 1, 
    experimental_backgroundImage: "radial-gradient(#fefbff 65%, #e2e1ec 85%, #dfe1f9 95%)",
  },

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

  stopBadge: {
    backgroundColor: colors.primaryContainer,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },

  stopBadgeText: { 
    fontFamily: "RobotoMono-Regular", 
    fontSize: 15, 
    color: colors.primary },
  
  heroImage: { 
    width: 84, 
    height: 84, 
    marginVertical: 4 },
  
  heading: { 
    fontFamily: "PixelifySans-SemiBold", 
    fontSize: 48, 
    color: colors.text,
    textAlign: 'center',
   },
  
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

  clueText: { fontFamily: "RobotoMono-Regular", fontSize: 16, color: colors.text, lineHeight: 24, textAlign: 'center' },
  
  distanceBadge: { fontFamily: "PixelifySans-SemiBold", fontSize: 40, color: colors.textMuted, marginTop: 16 },
  
  buttonContainer: {
    width: '100%',
    height: 60,
    marginTop: 4,
  },

  buttonImage: {
    width: '100%',
    height: '100%',
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

  card: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: 'transparent',
    borderRadius: 4,
    padding: 16,
    width: '100%',
    height: '100%',
    marginBottom: 16,
  },

});

