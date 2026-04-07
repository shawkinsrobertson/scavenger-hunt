import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
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
  const radius = stop.arrivalRadius ?? 30;

  const distance =
    geo.lat !== null && geo.lng !== null
      ? distanceBetween(geo.lat, geo.lng, stop.location.lat, stop.location.lng)
      : null;

  const hasArrived = distance !== null && distance <= radius;

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

          <Image source={require('../assets/compass.png')} style={styles.heroImage} />
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
            <TouchableOpacity style={styles.arrivedBtn} onPress={onArrived} activeOpacity={0.85}>
              <Text style={styles.btnText}>I'm Here! 📍</Text>
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
    borderRadius: 24,
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
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  stopBadgeText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  heroImage: { width: 84, height: 84, marginVertical: 4 },
  heading: { fontSize: 22, fontWeight: '700', color: colors.text },
  muted: { fontSize: 15, color: colors.textMuted },
  errorBox: {
    backgroundColor: colors.errorContainer,
    borderRadius: 12,
    padding: 14,
    width: '100%',
  },
  errorText: { fontSize: 14, color: colors.error, marginBottom: 4 },
  errorSmall: { fontSize: 12, color: colors.onErrorContainer },
  clueBox: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 14,
    padding: 16,
    width: '100%',
  },
  clueText: { fontSize: 16, color: colors.text, lineHeight: 24 },
  distanceBadge: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  arrivedBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  btnText: { color: colors.onPrimary, fontSize: 17, fontWeight: '700' },
  accuracy: { fontSize: 12, color: colors.outline },
});
