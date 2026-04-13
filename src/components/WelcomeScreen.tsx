import { useState, useRef, useEffect } from 'react';
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
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(t);
  }, []);

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
          <Image
            source={require('../assets/cake.png')}
            style={styles.heroImage}
          />
          <Text style={styles.title}>
            {hunt.title}
            <Text style={styles.cursor}>{cursorVisible ? ' |' : '  '}</Text>
          </Text>
          <Text style={styles.message}>{hunt.welcomeMessage}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{hunt.stops.length} stops to find</Text>
          </View>
          <TouchableOpacity onPress={handleButtonPress} activeOpacity={1} style={styles.buttonContainer}>
            <Animated.Image
              source={require('../assets/start-hunt-primary.png')}
              style={[
                styles.buttonImage,
                {
                  transform: [{ translateX }, { translateY }],
                },
              ]}
            />
          </TouchableOpacity>
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
    fontFamily: "PixelifySans-Regular",
    fontSize: 60,
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
    marginBottom: 16,
    marginTop: 16,
    marginLeft: 12,
    marginRight: 12,
    flexShrink: 1,
    flexWrap: 'wrap',
    alignSelf: 'center',
  },

  badge: {
    backgroundColor: colors.primaryContainer,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 24,
  },

  badgeText: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 15,
    color: colors.onPrimaryContainer,
    fontWeight: '600',
  },

  buttonContainer: {
    width: '100%',
    height: 60,
    marginTop: 8,
  },

  cursor: {
    fontSize: 28,
    fontWeight: '200',
    color: colors.text,
    lineHeight: 60,
  },

  buttonImage: {
   width: '100%',
   height: '100%',
   resizeMode: 'contain',
  },
});
