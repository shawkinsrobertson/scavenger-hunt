import { useEffect, useState } from 'react';
import { hunt } from './src/data/hunt';
import { WelcomeScreen } from './src/components/WelcomeScreen';
import { ClueScreen } from './src/components/ClueScreen';
import { PickupScreen } from './src/components/PickupScreen';
import { CelebrationScreen } from './src/components/CelebrationScreen';
import { useDistanceTracker } from './src/hooks/useDistanceTracker';
import * as Font from 'expo-font';

type Phase = 'welcome' | 'clue' | 'pickup' | 'celebration';

// Set to true to skip GPS and navigate freely for testing/styling.
// Flip back to false before sharing the hunt with the real user.
const DEV_MODE = true;

export default function App() {
  const [phase, setPhase] = useState<Phase>('welcome');
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [fontsLoaded, setFontsLoaded] = useState(false);

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

  if (!fontsLoaded) {
    return null;
  }

  const currentStop = hunt.stops[currentStopIndex];

  function handleArrived() {
    setPhase('pickup');
  }

  function handleConfirmed() {
    const isLast = currentStopIndex >= hunt.stops.length - 1;
    if (isLast) {
      setPhase('celebration');
    } else {
      setCurrentStopIndex(i => i + 1);
      setPhase('clue');
    }
  }

  if (phase === 'welcome') {
    return <WelcomeScreen hunt={hunt} onStart={() => setPhase('clue')} />;
  }
  if (phase === 'clue' && currentStop) {
    return (
      <ClueScreen
        stop={currentStop}
        stopNumber={currentStopIndex + 1}
        totalStops={hunt.stops.length}
        onArrived={handleArrived}
        devMode={DEV_MODE}
      />
    );
  }
  if (phase === 'pickup' && currentStop) {
    return (
      <PickupScreen
        stop={currentStop}
        stopNumber={currentStopIndex + 1}
        totalStops={hunt.stops.length}
        onConfirmed={handleConfirmed}
        devMode={DEV_MODE}
      />
    );
  }
  return (
    <CelebrationScreen
      message={hunt.celebrationMessage}
      totalStops={hunt.stops.length}
      distanceMeters={distanceMeters}
      stepsWalked={stepsWalked}
    />
  );
}
