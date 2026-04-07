import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { Hunt } from '../data/hunt';
import { colors } from '../styles/colors';

interface Props {
  hunt: Hunt;
  onStart: () => void;
}

export function WelcomeScreen({ hunt, onStart }: Props) {
  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Image
            source={require('../assets/treasure-chest.png')}
            style={styles.heroImage}
          />
          <Text style={styles.title}>{hunt.title}</Text>
          <Text style={styles.message}>{hunt.welcomeMessage}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{hunt.stops.length} stops to find</Text>
          </View>
          <TouchableOpacity style={styles.btn} onPress={onStart} activeOpacity={0.85}>
            <Text style={styles.btnText}>LET'S GO!</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 32,
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    gap: 18,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 10,
  },
  heroImage: {
    width: 112,
    height: 112,
    marginBottom: 8,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 24,
    textAlign: 'left',
    width: '100%',
  },
  badge: {
    backgroundColor: colors.primaryContainer,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 14,
    color: colors.onPrimaryContainer,
    fontWeight: '600',
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  btnText: {
    color: colors.onPrimary,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
