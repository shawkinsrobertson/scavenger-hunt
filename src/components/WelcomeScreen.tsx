import { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { Hunt } from '../data/hunt';
import { colors } from '../styles/colors';

interface Props {
  hunt: Hunt;
  onStart: () => void;
}

export function WelcomeScreen({ hunt, onStart }: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

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
    onStart();
  }

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
          <TouchableOpacity onPress={handleButtonPress} activeOpacity={1} style={styles.buttonContainer}>
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
    borderRadius: 4,
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
    fontFamily: "PixelifySans-Bold",
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    fontFamily: "RobotoMono-Regular",
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
    fontFamily: "RobotoMono-Medium",
    fontSize: 14,
    color: colors.onPrimaryContainer,
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
    height: 60,
    marginTop: 8,
  },
  buttonImage: {
   width: '100%',
   height: '100%',
   resizeMode: 'contain',
  },
});
