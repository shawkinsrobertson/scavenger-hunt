import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { HuntStop } from '../data/hunt';
import { colors } from '../styles/colors';

interface Props {
  stop: HuntStop;
  stopNumber: number;
  totalStops: number;
  onConfirmed: () => void;
  devMode?: boolean;
}

export function PickupScreen({ stop, stopNumber, totalStops, onConfirmed, devMode }: Props) {
  const [confirmed, setConfirmed] = useState(false);
  const emojiScale = useRef(new Animated.Value(0)).current;
  const buttonTranslateX = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(0)).current;

  const progressPercent = ((stopNumber - 1) / totalStops) * 100;

  function handleButtonPress() {
    Animated.parallel([
      Animated.timing(buttonTranslateX, {
        toValue: -6,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonTranslateY, {
        toValue: 6,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(buttonTranslateX, { toValue: 0, duration: 100, useNativeDriver: true }),
        Animated.timing(buttonTranslateY, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
    });
    setConfirmed(true);
    Animated.spring(emojiScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
    setTimeout(onConfirmed, devMode ? 0 : 2200);
  }

  useEffect(() => {
    // reset when reused
    emojiScale.setValue(0);
    buttonTranslateX.setValue(0);
    buttonTranslateY.setValue(0);
    setConfirmed(false);
  }, [stop.id]);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
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
              <Image source={require('../assets/icon-chest.png')} style={styles.heroImage} />
              <Text style={styles.heading}>You're Here!</Text>
              <View style={styles.arrivalBox}>
                <Text style={styles.arrivalText}>{stop.arrivalMessage}</Text>
              </View>
              <TouchableOpacity onPress={handleButtonPress} activeOpacity={1} style={styles.buttonContainer}>
                <Animated.Image
                  source={require('../assets/confirm-pickup-secondary.png')}
                  style={[
                    styles.buttonImage,
                    {
                      transform: [{ translateX: buttonTranslateX }, { translateY: buttonTranslateY }],
                    },
                  ]}
                />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Animated.Text style={[styles.confirmedEmoji, { transform: [{ scale: emojiScale }] }]}>🎊</Animated.Text>
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
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
});

const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    experimental_backgroundImage: "radial-gradient(#fefbff 65%, #e2e1ec 85%, #dfe1f9 95%)",
   },

  progressTrack: { 
    height: 5, 
    backgroundColor: 'rgba(0,0,0,0.12)' 
  },

  progressBar: {
    height: 5,
    backgroundColor: colors.primary,
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

  stopBadge: {
    backgroundColor: colors.primaryContainer,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },

  stopBadgeText: { 
    fontFamily: "RobotoMono-Regular", 
    fontSize: 15, 
    color: colors.primary 
  },
  
  heroImage: { 
    width: 180, 
    height:180, 
   },

  confirmedEmoji: { fontSize: 56 },

  heading: { 
    fontFamily: "PixelifySans-SemiBold",
    fontSize: 42, 
    color: colors.text, 
    textAlign: 'center', 
    },

  arrivalBox: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 4,
    padding: 16,
    width: '80%',
  },

  arrivalText: { 
    fontFamily: "RobotoMono-Regular", 
    fontSize: 16, 
    color: colors.text, 
    lineHeight: 24 
  },
  
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
});

export default PickupScreen;
