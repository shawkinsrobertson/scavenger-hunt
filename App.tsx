import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { hunt } from './src/data/hunt';
import { WelcomeScreen } from './src/components/WelcomeScreen';
import { ClueScreen } from './src/components/ClueScreen';
import { PickupScreen } from './src/components/PickupScreen';
import { CelebrationScreen } from './src/components/CelebrationScreen';
import { IrisTransition } from './src/components/IrisTransition';
import { useDistanceTracker } from './src/hooks/useDistanceTracker';
import * as Font from 'expo-font';

type Phase = 'welcome' | 'clue' | 'pickup' | 'celebration';

const DEV_MODE = true;

export default function App() {
  const [phase, setPhase] = useState<Phase>('welcome');
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [irisOpen, setIrisOpen] = useState(true);
  const [pendingPhase, setPendingPhase] = useState<Phase | null>(null);

  const huntActive = phase === 'clue' || phase === 'pickup';
  const distanceMeters = useDistanceTracker(huntActive);
  const stepsWalked = Math.round(distanceMeters * 1.3);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'PixelifySans-Regular': require('./src/assets/Fonts/PixelifySans-Regular.ttf'),
        'PixelifySans-Bold': require('./src/assets/Fonts/PixelifySans-Bold.ttf'),
        'PixelifySans-Medium': require('./src/assets/Fonts/PixelifySans-Medium.ttf'),
        'PixelifySans-SemiBold': require('./src/assets/Fonts/PixelifySans-SemiBold.ttf'),
        'RobotoMono-Regular': require('./src/assets/Fonts/RobotoMono-Regular.ttf'),
        'RobotoMono-Light': require('./src/assets/Fonts/RobotoMono-Light.ttf'),
        'RobotoMono-Medium': require('./src/assets/Fonts/RobotoMono-Medium.ttf'),
        'RobotoMono-Bold': require('./src/assets/Fonts/RobotoMono-Bold.ttf'),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  // --- early return for font loading, NO other code inside here ---
  if (!fontsLoaded) {
    return null;
  }

  // --- all functions and logic go here, AFTER the early return ---

  function transitionTo(nextPhase: Phase) {
    setPendingPhase(nextPhase);
    setIrisOpen(false);
  }

  function handleIrisClosed() {
    if (pendingPhase) {
      setPhase(pendingPhase);
      setPendingPhase(null);
    }
    setTimeout(() => setIrisOpen(true), 350);
  }

  const currentStop = hunt.stops[currentStopIndex];

  function handleArrived() {
    transitionTo('pickup');
  }

  function handleConfirmed() {
    const isLast = currentStopIndex >= hunt.stops.length - 1;
    if (isLast) {
      transitionTo('celebration');
    } else {
      setCurrentStopIndex(i => i + 1);
      transitionTo('clue');
    }
  }

  return (
    <View style={styles.container}>

      {phase === 'welcome' && (
        <WelcomeScreen hunt={hunt} onStart={() => transitionTo('clue')} />
      )}

      {phase === 'clue' && currentStop && (
        <ClueScreen
          stop={currentStop}
          stopNumber={currentStopIndex + 1}
          totalStops={hunt.stops.length}
          onArrived={handleArrived}
          devMode={DEV_MODE}
        />
      )}

      {phase === 'pickup' && currentStop && (
        <PickupScreen
          stop={currentStop}
          stopNumber={currentStopIndex + 1}
          totalStops={hunt.stops.length}
          onConfirmed={handleConfirmed}
          devMode={DEV_MODE}
        />
      )}

      {phase === 'celebration' && (
        <CelebrationScreen
          message={hunt.celebrationMessage}
          totalStops={hunt.stops.length}
          distanceMeters={distanceMeters}
          stepsWalked={stepsWalked}
        />
      )}

      {/* Iris overlay — sits on top of all screens */}
      <IrisTransition
        visible={irisOpen}
        onClosed={handleIrisClosed}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});