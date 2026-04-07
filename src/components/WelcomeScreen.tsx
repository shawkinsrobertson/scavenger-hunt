import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { Hunt } from '../data/hunt';

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
          <Text style={styles.emoji}>🗺️</Text>
          <Text style={styles.title}>{hunt.title}</Text>
          <Text style={styles.message}>{hunt.welcomeMessage}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{hunt.stops.length} stops to find</Text>
          </View>
          <TouchableOpacity style={styles.btn} onPress={onStart} activeOpacity={0.85}>
            <Text style={styles.btnText}>Let's Go! 🚀</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#7c3aed',
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    textAlign: 'left',
    width: '100%',
  },
  badge: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  btn: {
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  btnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
